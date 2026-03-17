const jwt = require("jsonwebtoken");

// ✅ Place this file at: middleware/authMiddleware.js
// Then import it consistently in all routers:
//   const auth = require("../middleware/authMiddleware");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Authorization header missing or malformed" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};