const express = require('express');
const router = express.Router();
const UserModal = require('../modals/UserModal');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * REGISTER
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1️⃣ Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters"
      });
    }

    if (password.length < 3) {
      return res.status(400).json({
        message: "Password must be at least 3 characters"
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await UserModal.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // 3️⃣ Generate avatar
    const profileImage =
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Create user
    const user = await UserModal.create({
      username,
      email,
      password: hashedPassword,
      image: profileImage
    });

    // 6️⃣ Generate JWT
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.MY_SECRET,
      { expiresIn: "12d" }
    );

    // 7️⃣ Send response
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * LOGIN
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await UserModal.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.MY_SECRET,
      { expiresIn: "12d" }
    );

     res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 12 * 24 * 60 * 60 * 1000
  });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
