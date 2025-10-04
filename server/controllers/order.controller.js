const mongoose = require("mongoose");
const { Order } = require("../models");

// helpers
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isEmail = (q = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q);

module.exports = {
  async getOrders(req, res) {
    //parse query params
    const {
      q, // search: name or email
      ids, // CSV of order ids to fetch
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

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
      const rx = { $regex: escapeRegex(q), $options: "i" };
      if (isEmail(q)) {
        filter["customer.email"] = rx;
      } else {
        filter["customer.name"] = rx;
      }
    }

    if (ids) {
      const objIds = ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (objIds.length) filter._id = { $in: objIds };
    }

    const [data, total] = await Promise.all([
      Order.find(filter)
        .sort({ [sortField]: sortDir })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      Order.countDocuments(filter),
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

  async createOrder(req, res) {
    const order = await Order.create(req.body);
    return res.status(201).json(order);
  },
};
