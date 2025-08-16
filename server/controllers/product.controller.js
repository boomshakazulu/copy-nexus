const mongoose = require("mongoose");
const { Product } = require("../models");

// helpers
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normModel = (s = "") => s.toLowerCase().replace(/[\s-_.]/g, "");

module.exports = {
  async getProducts(req, res) {
    try {
      //parse query params
      const {
        q, // name contains
        model, // copier model prefix search
        category, // "copier" | "part" | "toner"
        visibility, // default "active"
        inStock, // "true"/"false"
        rentable, // "true"/"false"
        minPrice, // filter by purchasePrice
        maxPrice,
        ids, // CSV of product ids to fetch
        fields, // projection: "name,category,images"
        sort = "createdAt",
        order = "desc",
        page = 1,
        limit = 20,
      } = req.query;

      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const perPage = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
      const sortDir = order === "asc" ? 1 : -1;
      const allowedSort = [
        "createdAt",
        "updatedAt",
        "name",
        "purchasePrice",
        "stockQty",
      ];
      const sortField = allowedSort.includes(sort) ? sort : "createdAt";

      // build filter
      const filter = {};

      // visibility default
      filter.visibility = visibility || "active";

      if (category) filter.category = category;

      if (inStock === "true" || inStock === "false") {
        filter.inStock = inStock === "true";
      }

      if (rentable === "true" || rentable === "false") {
        filter.rentable = rentable === "true";
      }

      if (q) {
        filter.name = { $regex: escapeRegex(q), $options: "i" };
      }

      if (model) {
        const prefix = normModel(model);
        // anchored regex so Mongo can use the index on copierModel_norm
        filter.copierModel_norm = new RegExp("^" + escapeRegex(prefix));
      }

      if (minPrice || maxPrice) {
        filter.purchasePrice = {};
        if (minPrice) filter.purchasePrice.$gte = Number(minPrice);
        if (maxPrice) filter.purchasePrice.$lte = Number(maxPrice);
      }

      if (ids) {
        const idList = ids
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const objIds = idList
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id));
        if (objIds.length) filter._id = { $in: objIds };
      }

      const projection =
        fields && typeof fields === "string"
          ? fields
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .join(" ")
          : "-__v"; // default: hide __v

      const [data, total] = await Promise.all([
        Product.find(filter)
          .select(projection)
          .sort({ [sortField]: sortDir })
          .skip((pageNum - 1) * perPage)
          .limit(perPage)
          .lean(),
        Product.countDocuments(filter),
      ]);

      return res.json({
        data,
        pagination: {
          total,
          page: pageNum,
          limit: perPage,
          hasNext: pageNum * perPage < total,
        },
        sort: { field: sortField, order: sortDir === 1 ? "asc" : "desc" },
        filter,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
};
