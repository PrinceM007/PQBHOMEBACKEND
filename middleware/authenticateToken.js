const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Database connection

const router = express.Router();

// JWT Secret (store in env variable for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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
