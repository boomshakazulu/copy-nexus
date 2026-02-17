const mongoose = require("mongoose");
const { Rental, RentalPayment, AccessLog } = require("../models");
const { unprocessable, badRequest, notFound } = require("../utils/httpError");

const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = {
  async createRental(req, res) {
    const { items, customer, shippingAddress, notes, dueDate } = req.body || {};
    if (!Array.isArray(items) || !items.length) {
      throw unprocessable("Rental must have at least one item");
    }
    const start = new Date();
    const nextDue = dueDate ? new Date(dueDate) : new Date(start);
    if (Number.isNaN(nextDue.getTime())) {
      throw unprocessable("Invalid due date");
    }
    if (!dueDate) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    const normalizedItems = items.map((item, index) => ({
      orderItemIndex: typeof item.orderItemIndex === "number" ? item.orderItemIndex : index,
      product: item.product || null,
      name: String(item.name || "").trim(),
      model: String(item.model || "").trim(),
      qty: Number(item.qty) || 1,
      monthlyPrice: Number(item.monthlyPrice) || 0,
      rentCostPerPrint: Number(item.rentCostPerPrint) || 0,
      rentCostPerScan: Number(item.rentCostPerScan) || 0,
    }));
    const rental = await Rental.create({
      items: normalizedItems,
      status: "active",
      startDate: start,
      dueDate: nextDue,
      customer: customer || {},
      shippingAddress: shippingAddress || {},
      notes: typeof notes === "string" ? notes.trim() : "",
    });
    return res.status(201).json(rental.toObject());
  },

  async getRentalId(req, res) {
    const { id } = req.query || {};
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw badRequest("Valid rental id is required");
    }
    const rental = await Rental.findById(id).lean();
    if (!rental) {
      throw notFound("Rental not found");
    }
    const actorId = req.user?.id || null;
    const actorEmail = req.user?.email || "";
    const ip = req.ip || req.headers["x-forwarded-for"] || "";
    const userAgent = req.headers["user-agent"] || "";
    await AccessLog.create({
      actorId,
      actorEmail,
      action: "view_id",
      entityType: "rental",
      entityId: rental._id,
      ip: Array.isArray(ip) ? ip[0] : ip,
      userAgent,
      meta: { scope: "admin_rental_details" },
    });
    return res.json({ id: rental._id, idNumberFull: rental?.customer?.idNumber || "" });
  },
  async getRental(req, res) {
    const { id } = req.query || {};
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw badRequest("Valid rental id is required");
    }
    const rental = await Rental.findById(id).lean();
    if (!rental) {
      throw notFound("Rental not found");
    }
    return res.json(rental);
  },

  async rentalExists(req, res) {
    const { orderId } = req.query || {};
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      throw badRequest("Valid order id is required");
    }
    const found = await Rental.findOne({ order: orderId }).select("_id").lean();
    return res.json({ exists: !!found });
  },

  async getRentals(req, res) {
    const {
      q,
      status,
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

    const sortFieldMap = {
      createdAt: "createdAt",
      dueDate: "dueDate",
      name: "name",
      email: "customer.email",
    };

    const sortField = sortFieldMap[sort] || "createdAt";

    const filter = {};

    if (q) {
      const trimmed = String(q).trim();
      const rx = { $regex: escapeRegex(trimmed), $options: "i" };
      filter.$or = [
        { name: rx },
        { model: rx },
        { "customer.name": rx },
        { "customer.email": rx },
        { "customer.phone": rx },
      ];
    }

    if (status) {
      const allowed = Rental.schema.path("status").enumValues || [];
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
      Rental.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Rental.countDocuments(filter),
    ]);

    return res.json({
      data,
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

  async updateRental(req, res) {
    const {
      id,
      dueDate,
      items,
      notes,
      status,
      customer,
      shippingAddress,
    } = req.body || {};

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw badRequest("Valid rental id is required");
    }

    const rental = await Rental.findById(id);
    if (!rental) {
      throw notFound("Rental not found");
    }

    if (dueDate) {
      const nextDue = new Date(dueDate);
      if (Number.isNaN(nextDue.getTime())) {
        throw unprocessable("Invalid due date");
      }
      rental.dueDate = nextDue;
    }

    if (Array.isArray(items) && items.length) {
      const nextItems = items.map((item) => {
        const monthlyPrice = Number(item.monthlyPrice) || 0;
        const rentCostPerPrint = Number(item.rentCostPerPrint) || 0;
        const rentCostPerScan = Number(item.rentCostPerScan) || 0;
        if (monthlyPrice < 0) throw unprocessable("Monthly price must be >= 0");
        if (rentCostPerPrint < 0) throw unprocessable("Price per print must be >= 0");
        if (rentCostPerScan < 0) throw unprocessable("Price per scan must be >= 0");
        return {
          orderItemIndex: item.orderItemIndex,
          product: item.product || null,
          name: String(item.name || "").trim(),
          model: String(item.model || "").trim(),
          qty: Number(item.qty) || 1,
          monthlyPrice,
          rentCostPerPrint,
          rentCostPerScan,
        };
      });
      rental.items = nextItems;
    }

    if (typeof notes === "string") {
      rental.notes = notes.trim();
    }
    if (customer && typeof customer === "object") {
      rental.customer = {
        ...rental.customer?.toObject?.(),
        ...customer,
      };
    }
    if (shippingAddress && typeof shippingAddress === "object") {
      rental.shippingAddress = {
        ...rental.shippingAddress?.toObject?.(),
        ...shippingAddress,
      };
    }

    if (status === "ended") {
      rental.status = "ended";
      rental.endedAt = new Date();
    }
    if (status === "active") {
      rental.status = "active";
      rental.endedAt = null;
    }

    await rental.save();
    return res.json(rental.toObject());
  },

  async getRentalPayments(req, res) {
    const { rentalId } = req.query || {};
    if (!rentalId || !mongoose.Types.ObjectId.isValid(rentalId)) {
      throw badRequest("Valid rental id is required");
    }
    const payments = await RentalPayment.find({ rental: rentalId })
      .sort({ paidAt: -1 })
      .lean();
    return res.json({ data: payments });
  },

  async addRentalPayment(req, res) {
    const { rentalId, amount, items, notes, discount } = req.body || {};
    if (!rentalId || !mongoose.Types.ObjectId.isValid(rentalId)) {
      throw badRequest("Valid rental id is required");
    }
    const rental = await Rental.findById(rentalId);
    if (!rental) {
      throw notFound("Rental not found");
    }
    const nextAmount = Number(amount);
    if (!Number.isFinite(nextAmount) || nextAmount < 0) {
      throw unprocessable("Amount must be >= 0");
    }
    const rentalItems = Array.isArray(rental.items) ? rental.items : [];
    const baseMonthly = rentalItems.reduce(
      (sum, item) =>
        sum + (Number(item.monthlyPrice) || 0) * (Number(item.qty) || 1),
      0
    );
    const nextItems = Array.isArray(items)
      ? items.map((item) => {
          const match = rentalItems.find(
            (ri) => ri.orderItemIndex === item.orderItemIndex
          );
          return {
            orderItemIndex: item.orderItemIndex,
            name: match?.name || "",
            model: match?.model || "",
            monthlyPrice: Number(match?.monthlyPrice) || 0,
            qty: Number(match?.qty) || 1,
            ratePerPrint: Number(match?.rentCostPerPrint) || 0,
            ratePerScan: Number(match?.rentCostPerScan) || 0,
            copies: Number(item.copies) || 0,
            scans: Number(item.scans) || 0,
          };
        })
      : [];
    const nextDiscount = Number(discount) || 0;
    if (nextDiscount < 0) {
      throw unprocessable("Discount must be >= 0");
    }

    const payment = await RentalPayment.create({
      rental: rental._id,
      amount: nextAmount,
      discount: nextDiscount,
      monthlyBase: baseMonthly,
      items: nextItems,
      notes: typeof notes === "string" ? notes.trim() : "",
    });

    const base = rental.dueDate && rental.dueDate > new Date()
      ? new Date(rental.dueDate)
      : new Date();
    base.setMonth(base.getMonth() + 1);
    rental.dueDate = base;
    await rental.save();

    return res.json({ rental: rental.toObject(), payment: payment.toObject() });
  },

  async updateRentalPayment(req, res) {
    const { id, amount, items, notes, discount } = req.body || {};
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw badRequest("Valid payment id is required");
    }
    const payment = await RentalPayment.findById(id);
    if (!payment) {
      throw notFound("Payment not found");
    }
    if (typeof amount === "number" && Number.isFinite(amount)) {
      if (amount < 0) throw unprocessable("Amount must be >= 0");
      payment.amount = amount;
    }
    if (typeof discount === "number" && Number.isFinite(discount)) {
      if (discount < 0) throw unprocessable("Discount must be >= 0");
      payment.discount = discount;
    }
    if (Array.isArray(items)) {
      payment.items = items.map((item) => ({
        orderItemIndex: item.orderItemIndex,
        name: String(item.name || "").trim(),
        model: String(item.model || "").trim(),
        monthlyPrice: Number(item.monthlyPrice) || 0,
        qty: Number(item.qty) || 1,
        ratePerPrint: Number(item.ratePerPrint) || 0,
        ratePerScan: Number(item.ratePerScan) || 0,
        copies: Number(item.copies) || 0,
        scans: Number(item.scans) || 0,
      }));
    }
    if (typeof notes === "string") {
      payment.notes = notes.trim();
    }
    await payment.save();
    return res.json(payment.toObject());
  },

  async deleteRentalPayment(req, res) {
    const { id } = req.query || {};
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw badRequest("Valid payment id is required");
    }
    const payment = await RentalPayment.findById(id);
    if (!payment) {
      throw notFound("Payment not found");
    }
    await payment.deleteOne();
    return res.json({ ok: true, id });
  },
};
