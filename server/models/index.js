const User = require("./user.model");
const PendingUser = require("./pendingUser.model");
const Rental = require("./rental.model");
const RentalPayment = require("./rentalPayment.model");
const Product = require("./product.model");
const Order = require("./order.model");
const AccessLog = require("./accessLog.model");

module.exports = {
  User,
  PendingUser,
  Rental,
  RentalPayment,
  Product,
  Order,
  AccessLog,
};
