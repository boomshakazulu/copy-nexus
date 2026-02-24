const { AccessLog } = require("../models");
const { unprocessable } = require("../utils/httpError");

module.exports = {
  async getAccessLogs(req, res) {
    const {
      page = 1,
      limit = 50,
      action,
      entityType,
      actorEmail,
      entityId,
      from,
      to,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (actorEmail) {
      filter.actorEmail = { $regex: String(actorEmail), $options: "i" };
    }
    if (entityId) {
      filter.entityId = entityId;
    }
    if (from || to) {
      const range = {};
      if (from) {
        const start = new Date(from);
        if (Number.isNaN(start.getTime())) {
          throw unprocessable("Invalid from date");
        }
        range.$gte = start;
      }
      if (to) {
        const end = new Date(to);
        if (Number.isNaN(end.getTime())) {
          throw unprocessable("Invalid to date");
        }
        range.$lte = end;
      }
      filter.createdAt = range;
    }

    const [data, total] = await Promise.all([
      AccessLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      AccessLog.countDocuments(filter),
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
      filter,
    });
  },

  async createAccessLog(req, res) {
    const { entityId, entityType = "order", action = "view_id", scope = "admin_order_details" } = req.body || {};
    if (!entityId) {
      return res.status(400).json({ message: "entityId is required" });
    }
    const actorId = req.user?.id || null;
    const actorEmail = req.user?.email || "";
    const ip = req.ip || req.headers["x-forwarded-for"] || "";
    const userAgent = req.headers["user-agent"] || "";
    const log = await AccessLog.create({
      actorId,
      actorEmail,
      action,
      entityType,
      entityId,
      ip: Array.isArray(ip) ? ip[0] : ip,
      userAgent,
      meta: { scope },
    });
    return res.json({ ok: true, id: log._id });
  },
};
