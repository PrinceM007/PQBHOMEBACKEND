const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/db');

const router = express.Router();

// Environment variables or fallback for secret key
const JWT_SECRET = process.env.JWT_SECRET || 'b9f8e5a9d9b0f2e4b1e1f8b2e9e0b1f5'; // Replace with a secure key

// Sign-up route
router.post('/signup', async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Validate input
  if (!fullName || !email || !username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Check if the user already exists
    const [existingUser] = await promisePool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: "Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const [result] = await promisePool.query(
      "INSERT INTO users (fullName, email, username, password, createdAt) VALUES (?, ?, ?, ?, NOW())",
      [fullName, email, username, hashedPassword]
    );

    // Send a success response
    if (result.affectedRows === 1) {
      return res.status(201).json({ success: true, message: "User created successfully" });
    } else {
      throw new Error("Failed to insert user into the database");
    }
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ success: false, message: "Server error during signup", error: error.message });
  }
});
// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Query for the user by username
    const [users] = await promisePool.query("SELECT * FROM users WHERE username = ?", [username]);

    // Log the full user object to check what is returned
    console.log('Fetched user from database:', users);

    // Check if the user exists
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Send user data as response, without the token
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,  // Ensure email is included
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
