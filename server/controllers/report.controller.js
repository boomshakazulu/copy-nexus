const { Order } = require("../models");
const { unprocessable } = require("../utils/httpError");

const monthKeys = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

module.exports = {
  async getDashboard(req, res) {
    const { from, to } = req.query;
    const end = parseDate(to) || new Date();
    const start = parseDate(from);
    if (from && !start) {
      throw unprocessable("Invalid from date");
    }
    if (to && !end) {
      throw unprocessable("Invalid to date");
    }

    const rangeStart =
      start ||
      new Date(end.getFullYear(), end.getMonth(), end.getDate() - 30);
    const rangeEnd = end;

    const match = {
      createdAt: { $gte: rangeStart, $lte: rangeEnd },
    };

    const [kpi] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amounts.total" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const [recentOrders] = await Promise.all([
      Order.find(match)
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return res.json({
      range: {
        from: rangeStart.toISOString(),
        to: rangeEnd.toISOString(),
      },
      kpis: {
        totalSales: kpi?.totalSales || 0,
        orders: kpi?.orders || 0,
      },
      recentOrders,
    });
  },

  async getReports(req, res) {
    const { from, to } = req.query;
    const end = parseDate(to) || new Date();
    const start = parseDate(from);
    if (from && !start) {
      throw unprocessable("Invalid from date");
    }
    if (to && !end) {
      throw unprocessable("Invalid to date");
    }

    const rangeStart =
      start ||
      new Date(end.getFullYear(), end.getMonth(), end.getDate() - 30);
    const rangeEnd = end;

    const match = {
      status: { $in: ["shipped", "completed"] },
      completedAt: { $gte: rangeStart, $lte: rangeEnd },
    };

    const [kpi] = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$amounts.total" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const totalSales = kpi?.totalSales || 0;
    const orders = kpi?.orders || 0;
    const aov = orders ? Math.round(totalSales / orders) : 0;

    const salesByCategory = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $addFields: {
          category: {
            $cond: [
              { $gt: [{ $size: "$product" }, 0] },
              { $arrayElemAt: ["$product.category", 0] },
              {
                $cond: ["$items.isCustom", "services", "unknown"],
              },
            ],
          },
          lineTotal: {
            $multiply: ["$items.unitAmount", "$items.qty"],
          },
        },
      },
      {
        $group: {
          _id: "$category",
          sales: { $sum: "$lineTotal" },
        },
      },
      { $sort: { sales: -1 } },
    ]);

    const salesOverTime = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          sales: { $sum: "$amounts.total" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $addFields: {
          category: {
            $cond: [
              { $gt: [{ $size: "$product" }, 0] },
              { $arrayElemAt: ["$product.category", 0] },
              {
                $cond: ["$items.isCustom", "services", "unknown"],
              },
            ],
          },
          lineTotal: {
            $multiply: ["$items.unitAmount", "$items.qty"],
          },
        },
      },
      {
        $group: {
          _id: { name: "$items.name", category: "$category" },
          sales: { $sum: "$lineTotal" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    return res.json({
      range: {
        from: rangeStart.toISOString(),
        to: rangeEnd.toISOString(),
      },
      kpis: { totalSales, orders, aov },
      salesByCategory: salesByCategory.map((row) => ({
        key: row._id,
        sales: row.sales,
      })),
      salesOverTime: salesOverTime.map((row) => ({
        month: monthKeys[(row._id.month || 1) - 1],
        value: row.sales,
      })),
      topProducts: topProducts.map((row) => ({
        name: row._id.name,
        category: row._id.category,
        sales: row.sales,
      })),
    });
  },
};
