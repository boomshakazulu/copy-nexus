const mongoose = require("mongoose");
const { Order, AccessLog, User, Rental } = require("../models");
const { policyVersion } = require("../config/privacy");
const { unprocessable, badRequest, notFound } = require("../utils/httpError");
const { sendMail } = require("../utils/mailer");

// helpers
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isEmail = (q = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q);

module.exports = {
  async getOrders(req, res) {
    //parse query params
    const {
      q, // search: name or email
      ids, // CSV of order ids to fetch
      status, // CSV of statuses
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    if (order && order !== "asc" && order !== "desc") {
      throw unprocessable("Invalid sort order", { order });
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const sortDir = order === "asc" ? 1 : -1;

    // Map friendly sort fields to actual paths
    const sortFieldMap = {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      name: "customer.name",
      email: "customer.email",
    };

    const sortField = sortFieldMap[sort] || "createdAt";

    // build filter
    const filter = {};

    if (q) {
      const trimmed = String(q).trim();
      const rx = { $regex: escapeRegex(trimmed), $options: "i" };
      const hexOnly = trimmed.replace(/[^0-9a-fA-F]/g, "");
      const isObjectId = mongoose.Types.ObjectId.isValid(trimmed) ||
        mongoose.Types.ObjectId.isValid(hexOnly);
      const isShortId =
        /^[0-9a-fA-F]{6}$/.test(trimmed) ||
        /^[0-9a-fA-F]{6}$/.test(hexOnly);
      const isPartialHex =
        hexOnly.length >= 2 && hexOnly.length < 6;

      const orFilters = [
        { "customer.name": rx },
        { "customer.email": rx },
        { "customer.phone": rx },
      ];

      if (isObjectId) {
        const idValue = mongoose.Types.ObjectId.isValid(trimmed)
          ? trimmed
          : hexOnly;
        orFilters.push({ _id: new mongoose.Types.ObjectId(idValue) });
      }

      if (isShortId) {
        const shortId = /^[0-9a-fA-F]{6}$/.test(trimmed)
          ? trimmed
          : hexOnly;
        orFilters.push({
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: `${shortId}$`,
              options: "i",
            },
          },
        });
      }

      if (isPartialHex) {
        orFilters.push({
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: `${hexOnly}`,
              options: "i",
            },
          },
        });
      }

      filter.$or = orFilters;
    }

    if (ids) {
      const objIds = ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (!objIds.length) {
        throw unprocessable("No valid ids provided");
      }
      if (objIds.length) filter._id = { $in: objIds };
    }

    if (status) {
      const allowed = Order.schema.path("status").enumValues || [];
      const statusList = String(status)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const invalid = statusList.filter((s) => !allowed.includes(s));
      if (invalid.length) {
        throw unprocessable("Invalid status", { status: invalid });
      }
      filter.status = statusList.length === 1 ? statusList[0] : { $in: statusList };
    }

    const [data, total] = await Promise.all([
      Order.find(filter)
        .select("+customer.idNumberEncrypted")
        .sort({ [sortField]: sortDir })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const nextData = data.map((order) => {
      if (order?.customer) {
        delete order.customer.idNumberEncrypted;
      }
      return order;
    });

    return res.json({
      data: nextData,
      pagination: {
        total,
        page: pageNum,
        limit: perPage,
        totalPages: Math.max(1, Math.ceil(total / perPage)),
        hasNext: pageNum * perPage < total,
      },
      sort: { field: sortField, order: sortDir === 1 ? "asc" : "desc" },
      filter,
    });
  },

  async createOrder(req, res) {
    const { consentMeta, ...payload } = req.body || {};
    const isAdmin = req.user?.role === "admin";
    const suppressEmail = isAdmin || payload?.suppressEmail === true;
    if (payload?.suppressEmail != null) delete payload.suppressEmail;
    const ip = req.ip || req.headers["x-forwarded-for"] || "";
    const userAgent = req.headers["user-agent"] || "";
    const nextConsentMeta = {
      acceptedAt: new Date(),
      policyVersion: consentMeta?.policyVersion || policyVersion,
      ip: Array.isArray(ip) ? ip[0] : ip,
      userAgent,
    };
    const order = await Order.create({
      ...payload,
      consentMeta: nextConsentMeta,
    });

    const customerEmail = order.customer?.email;
    let accountExists = false;
    if (customerEmail) {
      const existingUser = await User.findOne({
        email: String(customerEmail).trim().toLowerCase(),
      })
        .select("_id")
        .lean();
      accountExists = !!existingUser;
    }

    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
    if (suppressEmail) {
      const response = order.toObject();
      response.accountExists = accountExists;
      return res.status(201).json(response);
    }
    const baseUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    const accountNote =
      customerEmail && !accountExists
        ? `\nCreate an account with ${customerEmail} to see your order history: ${baseUrl}/signup\n`
        : "";
    const subject = `New order request ${order._id}`;
    const itemLines = (order.items || [])
      .map((item) => {
        const unit = new Intl.NumberFormat(undefined, {
          maximumFractionDigits: 0,
        }).format(item.unitAmount || 0);
        return `- ${item.name} (${item.model || "n/a"}) x${item.qty} @ ${unit} COP`;
      })
      .join("\n");
    const rentalLines = (order.items || [])
      .filter((item) => item.IsRented)
      .map((item) => {
        const perPrint = new Intl.NumberFormat(undefined, {
          maximumFractionDigits: 0,
        }).format(item.rentCostPerPrint || 0);
        const perScan = new Intl.NumberFormat(undefined, {
          maximumFractionDigits: 0,
        }).format(item.rentCostPerScan || 0);
        return `  - ${item.name}: per print ${perPrint} COP, per scan ${perScan} COP`;
      })
      .join("\n");
    const text = `New order request\n\nCustomer: ${order.customer?.name}\nEmail: ${order.customer?.email}\nPhone: ${order.customer?.phone}\nID: ${order.customer?.idType || ""} ${order.customer?.idNumber || ""}\nPreferred contact: ${order.customer?.preferredContactMethod || ""}\n\nShipping:\n${order.shippingAddress?.streetAddress || ""}\n${order.shippingAddress?.neighborhood || ""}\n${order.shippingAddress?.city || ""} ${order.shippingAddress?.department || ""}\n${order.shippingAddress?.postalCode || ""}\n\nItems:\n${itemLines}\n${rentalLines ? `\nRental rates:\n${rentalLines}` : ""}\n\nNotes:\n${order.notes || ""}\n${accountNote}`;
    const html = `
      <h2>New order request</h2>
      <p><strong>Customer:</strong> ${order.customer?.name || ""}</p>
      <p><strong>Email:</strong> ${order.customer?.email || ""}</p>
      <p><strong>Phone:</strong> ${order.customer?.phone || ""}</p>
      <p><strong>ID:</strong> ${order.customer?.idType || ""} ${order.customer?.idNumber || ""}</p>
      <p><strong>Preferred contact:</strong> ${order.customer?.preferredContactMethod || ""}</p>
      <h3>Shipping</h3>
      <p>${order.shippingAddress?.streetAddress || ""}<br/>
      ${order.shippingAddress?.neighborhood || ""}<br/>
      ${order.shippingAddress?.city || ""} ${order.shippingAddress?.department || ""}<br/>
      ${order.shippingAddress?.postalCode || ""}</p>
      <h3>Items</h3>
      <ul>
        ${(order.items || [])
          .map((item) => {
            const unit = new Intl.NumberFormat(undefined, {
              maximumFractionDigits: 0,
            }).format(item.unitAmount || 0);
            return `<li>${item.name} (${item.model || "n/a"}) x${item.qty} @ ${unit} COP</li>`;
          })
          .join("")}
      </ul>
      ${
        (order.items || []).some((i) => i.IsRented)
          ? `<h4>Rental rates</h4>
             <ul>
               ${(order.items || [])
                 .filter((i) => i.IsRented)
                 .map((i) => {
                   const perPrint = new Intl.NumberFormat(undefined, {
                     maximumFractionDigits: 0,
                   }).format(i.rentCostPerPrint || 0);
                   const perScan = new Intl.NumberFormat(undefined, {
                     maximumFractionDigits: 0,
                   }).format(i.rentCostPerScan || 0);
                   return `<li>${i.name}: per print ${perPrint} COP, per scan ${perScan} COP</li>`;
                 })
                 .join("")}
             </ul>`
          : ""
      }
      ${order.notes ? `<h3>Notes</h3><p>${order.notes}</p>` : ""}
      ${
        customerEmail && !accountExists
          ? `<h3>See your order history</h3>
             <p>Create an account with <strong>${customerEmail}</strong> to view your order history.</p>
             <p><a href="${baseUrl}/signup">Create an account</a></p>`
          : ""
      }
    `;

    if (customerEmail) {
      await sendMail({
        to: customerEmail,
        subject: "We received your order request",
        text,
        html,
      });
    }
    if (adminEmail) {
      await sendMail({
        to: adminEmail,
        subject,
        text,
        html,
      });
    }
    const response = order.toObject();
    response.accountExists = accountExists;
    return res.status(201).json(response);
  },

  async updateOrder(req, res) {
    const {
      id,
      status,
      trackingNumber,
      shipping,
      discount,
      items,
      customer,
      shippingAddress,
      notes,
      sendUpdateEmail,
      createRentals,
    } = req.body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw badRequest("Valid order id is required");
    }

    const order = await Order.findById(id);
    if (!order) {
      throw notFound("Order not found");
    }

    if (status) {
      const allowed = Order.schema.path("status").enumValues || [];
      if (!allowed.includes(status)) {
        throw unprocessable("Invalid status", { status });
      }
      order.status = status;
      if (status === "shipped" || status === "completed") {
        if (!order.completedAt) {
          order.completedAt = new Date();
        }
      } else {
        order.completedAt = null;
      }
    }

    if (typeof trackingNumber === "string") {
      order.trackingNumber = trackingNumber.trim();
    }

    if (typeof shipping === "number" && Number.isFinite(shipping)) {
      if (shipping < 0) throw unprocessable("Shipping must be >= 0");
      order.amounts = order.amounts || {};
      order.amounts.shipping = shipping;
    }

    if (typeof discount === "number" && Number.isFinite(discount)) {
      if (discount < 0) throw unprocessable("Discount must be >= 0");
      order.amounts = order.amounts || {};
      order.amounts.discount = discount;
    }

    if (customer && typeof customer === "object") {
      const nextCustomer = {
        ...order.customer?.toObject?.(),
        ...customer,
      };
      if (typeof nextCustomer.email === "string") {
        nextCustomer.email = nextCustomer.email.trim().toLowerCase();
      }
      if (typeof nextCustomer.idNumber === "string") {
        nextCustomer.idNumberEncrypted = undefined;
        nextCustomer.idNumberLast4 = "";
      }
      order.customer = nextCustomer;
    }

    if (shippingAddress && typeof shippingAddress === "object") {
      const nextAddress = {
        ...order.shippingAddress?.toObject?.(),
        ...shippingAddress,
      };
      order.shippingAddress = nextAddress;
    }

    if (typeof notes === "string") {
      order.notes = notes.trim();
    }

    if (Array.isArray(items) && items.length) {
      const looksLikeFullReplace = items.every(
        (item) => item && item.name && (item.product || item.isCustom)
      );

      if (looksLikeFullReplace) {
        const nextItems = items.map((item) => {
          const qty = Number(item.qty) || 0;
          const unitAmount = Number(item.unitAmount) || 0;
          const rentCostPerScan = Number(item.rentCostPerScan) || 0;
          const rentCostPerPrint = Number(item.rentCostPerPrint) || 0;
          if (qty < 1) {
            throw unprocessable("Item qty must be >= 1");
          }
          if (unitAmount < 0) {
            throw unprocessable("Item price must be >= 0");
          }
          if (rentCostPerScan < 0) {
            throw unprocessable("Item rentCostPerScan must be >= 0");
          }
          if (rentCostPerPrint < 0) {
            throw unprocessable("Item rentCostPerPrint must be >= 0");
          }
          if (item.product) {
            if (!mongoose.Types.ObjectId.isValid(item.product)) {
              throw unprocessable("Invalid product id");
            }
          } else if (!item.isCustom) {
            throw unprocessable("Custom items must set isCustom");
          }
          return {
            product: item.product || null,
            name: String(item.name || "").trim(),
            model: String(item.model || "").trim(),
            qty,
            unitAmount,
            IsRented: !!item.IsRented,
            rentCostPerScan,
            rentCostPerPrint,
            isCustom: !!item.isCustom,
          };
        });
        if (!nextItems.length) {
          throw unprocessable("Order must have at least one line item");
        }
        order.items = nextItems;
      } else {
        items.forEach((update) => {
          const index = update?.index;
          const unitAmount = update?.unitAmount;
          if (typeof index !== "number") return;
          if (!order.items?.[index]) return;
          if (!order.items[index].IsRented) return;
          if (typeof unitAmount !== "number" || unitAmount < 0) return;
          order.items[index].unitAmount = unitAmount;
        });
      }
    }

    await order.save();
    const saved = order.toObject();
    if (saved?.customer) {
      delete saved.customer.idNumberEncrypted;
    }
    if (sendUpdateEmail && saved?.customer?.email) {
      const subject = `Your order was updated`;
      const trackingLabel = saved.trackingNumber
        ? `Tracking: ${saved.trackingNumber}\n`
        : "";
      const shippingText = saved.shippingAddress
        ? `Shipping:\n${saved.shippingAddress?.streetAddress || ""}\n${saved.shippingAddress?.neighborhood || ""}\n${saved.shippingAddress?.city || ""} ${saved.shippingAddress?.department || ""}\n${saved.shippingAddress?.postalCode || ""}\n`
        : "";
      const itemLines = (saved.items || [])
        .map((item) => {
          const unit = new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 0,
          }).format(item.unitAmount || 0);
          return `- ${item.name} (${item.model || "n/a"}) x${item.qty} @ ${unit} COP`;
        })
        .join("\n");
      const rentalLines = (saved.items || [])
        .filter((item) => item.IsRented)
        .map((item) => {
          const perPrint = new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 0,
          }).format(item.rentCostPerPrint || 0);
          const perScan = new Intl.NumberFormat(undefined, {
            maximumFractionDigits: 0,
          }).format(item.rentCostPerScan || 0);
          return `  - ${item.name}: per print ${perPrint} COP, per scan ${perScan} COP`;
        })
        .join("\n");
      const text = `Your order was updated\n\nOrder: ${saved._id}\nStatus: ${saved.status}\n${trackingLabel}\n${shippingText}\nItems:\n${itemLines}\n${rentalLines ? `\nRental rates:\n${rentalLines}` : ""}\n\nNotes:\n${saved.notes || ""}\n`;
      const shippingHtml = saved.shippingAddress
        ? `<h3>Shipping</h3>
           <p>${saved.shippingAddress?.streetAddress || ""}<br/>
           ${saved.shippingAddress?.neighborhood || ""}<br/>
           ${saved.shippingAddress?.city || ""} ${saved.shippingAddress?.department || ""}<br/>
           ${saved.shippingAddress?.postalCode || ""}</p>`
        : "";
      const trackingHtml = saved.trackingNumber
        ? `<p><strong>Tracking:</strong> ${saved.trackingNumber}</p>`
        : "";
      const html = `
        <h2>Your order was updated</h2>
        <p><strong>Order:</strong> ${saved._id}</p>
        <p><strong>Status:</strong> ${saved.status}</p>
        ${trackingHtml}
        ${shippingHtml}
        <h3>Items</h3>
        <ul>
          ${(saved.items || [])
            .map((item) => {
              const unit = new Intl.NumberFormat(undefined, {
                maximumFractionDigits: 0,
              }).format(item.unitAmount || 0);
              return `<li>${item.name} (${item.model || "n/a"}) x${item.qty} @ ${unit} COP</li>`;
            })
            .join("")}
        </ul>
        ${
          (saved.items || []).some((i) => i.IsRented)
            ? `<h4>Rental rates</h4>
               <ul>
                 ${(saved.items || [])
                   .filter((i) => i.IsRented)
                   .map((i) => {
                     const perPrint = new Intl.NumberFormat(undefined, {
                       maximumFractionDigits: 0,
                     }).format(i.rentCostPerPrint || 0);
                     const perScan = new Intl.NumberFormat(undefined, {
                       maximumFractionDigits: 0,
                     }).format(i.rentCostPerScan || 0);
                     return `<li>${i.name}: per print ${perPrint} COP, per scan ${perScan} COP</li>`;
                   })
                   .join("")}
               </ul>`
            : ""
        }
        ${saved.notes ? `<h3>Notes</h3><p>${saved.notes}</p>` : ""}
      `;
      await sendMail({
        to: saved.customer.email,
        subject,
        text,
        html,
      });
    }
    if (createRentals && (saved?.status === "shipped" || saved?.status === "completed")) {
      const rentedItems = (saved.items || [])
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => !!item?.IsRented);
      if (rentedItems.length) {
        const existing = await Rental.findOne({ order: saved._id }).select("_id").lean();
        if (!existing) {
          const baseStart = new Date();
          const dueDate = new Date(baseStart);
          dueDate.setMonth(dueDate.getMonth() + 1);
          const rentalDoc = {
            order: saved._id,
            items: rentedItems.map(({ item, index }) => ({
              orderItemIndex: index,
              product: item.product || null,
              name: item.name,
              model: item.model || "",
              qty: item.qty || 1,
              monthlyPrice: Number(item.unitAmount) || 0,
              rentCostPerPrint: Number(item.rentCostPerPrint) || 0,
              rentCostPerScan: Number(item.rentCostPerScan) || 0,
            })),
            startDate: baseStart,
            dueDate,
            customer: {
              name: saved.customer?.name || "",
              email: saved.customer?.email || "",
              phone: saved.customer?.phone || "",
              idType: saved.customer?.idType || "",
              idNumber: saved.customer?.idNumber || "",
              preferredContactMethod: saved.customer?.preferredContactMethod || "",
            },
            shippingAddress: {
              streetAddress: saved.shippingAddress?.streetAddress || "",
              neighborhood: saved.shippingAddress?.neighborhood || "",
              city: saved.shippingAddress?.city || "",
              department: saved.shippingAddress?.department || "",
              postalCode: saved.shippingAddress?.postalCode || "",
            },
            notes: saved.notes || "",
          };

          await Rental.create(rentalDoc);
        }
      }
    }
    return res.json(saved);
  },

  async getOrderId(req, res) {
    const { id } = req.query || {};
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw badRequest("Valid order id is required");
    }
    const order = await Order.findById(id)
      .select("+customer.idNumberEncrypted")
      .lean();
    if (!order) {
      throw notFound("Order not found");
    }
    const encrypted = order?.customer?.idNumberEncrypted;
    const full = Order.decryptIdNumber(encrypted);
    const actorId = req.user?.id || null;
    const actorEmail = req.user?.email || "";
    const ip = req.ip || req.headers["x-forwarded-for"] || "";
    const userAgent = req.headers["user-agent"] || "";
    await AccessLog.create({
      actorId,
      actorEmail,
      action: "view_id",
      entityType: "order",
      entityId: order._id,
      ip: Array.isArray(ip) ? ip[0] : ip,
      userAgent,
      meta: { scope: "admin_order_details" },
    });
    return res.json({ id: order._id, idNumberFull: full || "" });
  },
};
