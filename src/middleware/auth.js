const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Protects routes — verifies JWT and attaches req.user.
 *
 * FIX from original:
 *   - Uses async/await properly (original was sync-only)
 *   - Checks if user still exists in DB (token may be valid but user deleted)
 *   - Attaches full user object, not just { id }
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-fetch user to ensure they still exist and are active
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User no longer exists or is inactive" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please log in again" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Role-based access guard — use AFTER protect middleware.
 * Usage: router.delete("/...", protect, authorize("admin"), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Role '${req.user.role}' is not authorized for this action`,
    });
  }
  next();
};

module.exports = { protect, authorize };