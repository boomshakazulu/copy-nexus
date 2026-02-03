const mongoose = require("mongoose");
const { Product } = require("../models");
const { badRequest, unprocessable, notFound } = require("../utils/httpError");

// helpers
const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normModel = (s = "") => s.toLowerCase().replace(/[\s-_.]/g, "");
const isUrl = (s = "") => /^https?:\/\//.test(s);
const isNumber = (v) => typeof v === "number" && Number.isFinite(v);
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

const CATEGORY_VALUES = ["copier", "part", "toner"];
const VISIBILITY_VALUES = ["active", "archived"];
const SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "name",
  "purchasePrice",
  "stockQty",
];
const FIELD_WHITELIST = [
  "_id",
  "name",
  "subtitle",
  "model",
  "model_norm",
  "compatibleCopiers",
  "compatibleCopiers_norm",
  "category",
  "stockQty",
  "inStock",
  "visibility",
  "purchasePrice",
  "rentable",
  "rentPrice",
  "images",
  "description",
  "createdAt",
  "updatedAt",
];
const UPDATE_FIELDS = new Set([
  "name",
  "subtitle",
  "model",
  "compatibleCopiers",
  "category",
  "stockQty",
  "inStock",
  "visibility",
  "purchasePrice",
  "rentable",
  "rentPrice",
  "images",
  "description",
]);
const CREATE_FIELDS = new Set([...UPDATE_FIELDS]);

function validateProductPayload(payload, { partial, allowedKeys } = {}) {
  if (!payload || typeof payload !== "object") {
    throw badRequest("Request body must be an object");
  }

  const errors = {};
  const add = (k, m) => { errors[k] = m; };

  if (allowedKeys) {
    const keys = Object.keys(payload);
    const unknown = keys.filter((k) => !allowedKeys.has(k));
    if (unknown.length) {
      throw unprocessable("Unknown fields", { fields: unknown });
    }
  }

  const checkRequired = (key) => {
    if (!partial && payload[key] == null) add(key, "Required");
  };

  checkRequired("name");
  checkRequired("category");
  checkRequired("model");
  checkRequired("description");

  if (payload.name != null && !isNonEmptyString(payload.name)) {
    add("name", "Must be a non-empty string");
  }
  if (payload.model != null && !isNonEmptyString(payload.model)) {
    add("model", "Must be a non-empty string");
  }
  if (payload.description != null && !isNonEmptyString(payload.description)) {
    add("description", "Must be a non-empty string");
  }

  if (payload.category != null && !CATEGORY_VALUES.includes(payload.category)) {
    add("category", `Must be one of: ${CATEGORY_VALUES.join(", ")}`);
  }

  if (
    payload.visibility != null &&
    !VISIBILITY_VALUES.includes(payload.visibility)
  ) {
    add("visibility", `Must be one of: ${VISIBILITY_VALUES.join(", ")}`);
  }

  if (payload.stockQty != null && !isNumber(payload.stockQty)) {
    add("stockQty", "Must be a number");
  }
  if (payload.stockQty != null && payload.stockQty < 0) {
    add("stockQty", "Must be >= 0");
  }

  if (payload.purchasePrice != null && !isNumber(payload.purchasePrice)) {
    add("purchasePrice", "Must be a number");
  }
  if (payload.purchasePrice != null && payload.purchasePrice < 0) {
    add("purchasePrice", "Must be >= 0");
  }

  if (payload.rentable != null && typeof payload.rentable !== "boolean") {
    add("rentable", "Must be a boolean");
  }
  if (payload.rentPrice != null && !isNumber(payload.rentPrice)) {
    add("rentPrice", "Must be a number");
  }
  if (payload.rentPrice != null && payload.rentPrice < 0) {
    add("rentPrice", "Must be >= 0");
  }
  if (payload.rentable === true && payload.rentPrice == null) {
    add("rentPrice", "Required when rentable is true");
  }

  if (payload.images != null) {
    if (!Array.isArray(payload.images)) {
      add("images", "Must be an array");
    } else if (!payload.images.every((u) => isNonEmptyString(u) && isUrl(u))) {
      add("images", "All images must be valid URLs");
    }
  }

  if (payload.compatibleCopiers != null) {
    if (!Array.isArray(payload.compatibleCopiers)) {
      add("compatibleCopiers", "Must be an array of strings");
    } else if (!payload.compatibleCopiers.every(isNonEmptyString)) {
      add("compatibleCopiers", "Must be an array of strings");
    }
  }

  if (Object.keys(errors).length) {
    throw unprocessable("Invalid product data", errors);
  }
}

function validateUpdatePayload(payload) {
  const keys = Object.keys(payload || {});
  const unknown = keys.filter((k) => !UPDATE_FIELDS.has(k) && k !== "_id");
  if (unknown.length) {
    throw unprocessable("Unknown fields", { fields: unknown });
  }
  validateProductPayload(payload, { partial: true });
}

module.exports = {
  async getProducts(req, res) {
    //parse query params
    const {
      q, // name contains
      model, // copier model prefix search
      category, // "copier" | "part" | "toner"
      visibility,
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

    if (category && !CATEGORY_VALUES.includes(category)) {
      throw unprocessable("Invalid category", { category });
    }
    if (visibility && !VISIBILITY_VALUES.includes(visibility)) {
      throw unprocessable("Invalid visibility", { visibility });
    }
    if (order && order !== "asc" && order !== "desc") {
      throw unprocessable("Invalid sort order", { order });
    }
    if (inStock && inStock !== "true" && inStock !== "false") {
      throw unprocessable("Invalid inStock", { inStock });
    }
    if (rentable && rentable !== "true" && rentable !== "false") {
      throw unprocessable("Invalid rentable", { rentable });
    }

    const parsedMinPrice =
      minPrice != null && minPrice !== "" ? Number(minPrice) : null;
    const parsedMaxPrice =
      maxPrice != null && maxPrice !== "" ? Number(maxPrice) : null;
    if (
      (parsedMinPrice != null && !Number.isFinite(parsedMinPrice)) ||
      (parsedMaxPrice != null && !Number.isFinite(parsedMaxPrice))
    ) {
      throw unprocessable("Invalid price range");
    }
    if (parsedMinPrice != null && parsedMinPrice < 0) {
      throw unprocessable("minPrice must be >= 0");
    }
    if (parsedMaxPrice != null && parsedMaxPrice < 0) {
      throw unprocessable("maxPrice must be >= 0");
    }
    if (
      parsedMinPrice != null &&
      parsedMaxPrice != null &&
      parsedMinPrice > parsedMaxPrice
    ) {
      throw unprocessable("minPrice cannot be greater than maxPrice");
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const sortDir = order === "asc" ? 1 : -1;
    const sortField = SORT_FIELDS.includes(sort) ? sort : "createdAt";

    // build filter
    const filter = {};

    // visibility default
    if (visibility) {
      filter.visibility = visibility;
    }

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
      const regex = new RegExp("^" + escapeRegex(prefix));
      if (category === "copier") {
        // anchored regex so Mongo can use the index on model_norm
        filter.model_norm = regex;
      } else {
        // parts/toner: match compatible copier models
        filter.compatibleCopiers_norm = regex;
      }
    }

    if (parsedMinPrice != null || parsedMaxPrice != null) {
      filter.purchasePrice = {};
      if (parsedMinPrice != null) filter.purchasePrice.$gte = parsedMinPrice;
      if (parsedMaxPrice != null) filter.purchasePrice.$lte = parsedMaxPrice;
    }

    if (ids) {
      const idList = ids
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const objIds = idList
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
      if (!objIds.length) {
        throw unprocessable("No valid ids provided");
      }
      if (objIds.length) filter._id = { $in: objIds };
    }

    let projection = "-__v"; // default: hide __v
    if (fields && typeof fields === "string") {
      const requested = fields
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const unknown = requested.filter((f) => !FIELD_WHITELIST.includes(f));
      if (unknown.length) {
        throw unprocessable("Unknown fields in projection", { fields: unknown });
      }
      projection = requested.join(" ");
    }

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
  },

  async createProduct(req, res) {
    validateProductPayload(req.body, {
      partial: false,
      allowedKeys: CREATE_FIELDS,
    });
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  },
  async updateProduct(req, res) {
    const { _id, ...updates } = req.body;
    if (!_id) throw badRequest("_id is required");
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw badRequest("Invalid product id");
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw badRequest("No updates provided");
    }

    validateUpdatePayload(req.body);

    const product = await Product.findByIdAndUpdate(_id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw notFound("Product not found");
    }

    return res.status(200).json(product);
  },
};
