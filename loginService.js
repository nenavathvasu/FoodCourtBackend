require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("./userSchema");

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect password");

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  user.token = token;
  user.tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
  await user.save();

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
};