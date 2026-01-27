const Order = require("./orderSchema");

exports.saveOrder = (data) => Order.create(data);

exports.getOrders = () => Order.find({}, { __v: 0 });