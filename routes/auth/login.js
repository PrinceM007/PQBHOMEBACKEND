const express = require('express');
const bcrypt = require('bcryptjs');
const { promisePool } = require('../config/db'); // Import the promise-enabled pool
const router = express.Router();

// Sign-up route
router.post('/signup', async (req, res) => {
  const { fullName, email, username, password } = req.body;

  try {
    // Check if user already exists
    const [existingUser] = await promisePool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await promisePool.query(
      "INSERT INTO users (fullName, email, username, password, createdAt) VALUES (?, ?, ?, ?, NOW())",
      [fullName, email, username, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: "Server error during signup", error: error.message });
  }
});

// Login route
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


// Validate route (not needed if no token is being used)
router.get('/validate', (req, res) => {
  // This route can be removed or replaced by session/cookie-based validation
  res.status(200).json({ message: 'No token-based authentication is used.' });
});

module.exports = router;
