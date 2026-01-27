const bcrypt = require("bcryptjs");
const User = require("./userSchema");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({ message: "Registered successfully", user: {
      id: user._id,
      name: user.name,
      email: user.email
    }});

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};