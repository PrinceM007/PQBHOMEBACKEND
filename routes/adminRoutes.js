const express = require('express');
const { promisePool } = require('../config/db'); // Import your database pool
const router = express.Router();

// Middleware to check admin role
const isAdmin = (req, res, next) => {
  const { role } = req.user; // Assuming `req.user` is populated from the JWT
  if (role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// Add a new room
router.post('/rooms', isAdmin, async (req, res) => {
  const { name, description, price, isAvailable } = req.body;
  try {
    const [result] = await promisePool.query(
      "INSERT INTO rooms (name, description, price, isAvailable) VALUES (?, ?, ?, ?)",
      [name, description, price, isAvailable]
    );
    res.status(201).json({ message: "Room added successfully", roomId: result.insertId });
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Update room details
router.put('/rooms/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, isAvailable } = req.body;
  try {
    await promisePool.query(
      "UPDATE rooms SET name = ?, description = ?, price = ?, isAvailable = ? WHERE id = ?",
      [name, description, price, isAvailable, id]
    );
    res.status(200).json({ message: "Room updated successfully" });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Delete a room
router.delete('/rooms/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await promisePool.query("DELETE FROM rooms WHERE id = ?", [id]);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Generate user reports
router.get('/users/report', isAdmin, async (req, res) => {
  try {
    const [users] = await promisePool.query("SELECT id, fullName, email, username, createdAt FROM users");
    res.status(200).json(users);
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
