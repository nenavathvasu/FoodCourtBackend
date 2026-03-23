module.exports = {
  // JWT
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",

  // Bcrypt
  SALT_ROUNDS: 10,

  // Order statuses (single source of truth)
  ORDER_STATUS: {
    PLACED:           "placed",
    CONFIRMED:        "confirmed",
    PREPARING:        "preparing",
    OUT_FOR_DELIVERY: "out_for_delivery",
    DELIVERED:        "delivered",
    CANCELLED:        "cancelled",
  },

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: "pending",
    PAID:    "paid",
    FAILED:  "failed",
    CREATED: "created",
  },

  PAYMENT_METHOD: {
    COD:     "cod",
    ONLINE:  "online",
  },

  // GST rate (18%)
  GST_RATE: 0.18,
};