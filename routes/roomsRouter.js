const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/db');

// Route to get rooms booked by a specific user
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;  // Get userId from the URL
  console.log('Fetching rooms booked by user:', userId);

  try {
    // Fetch rooms booked by the user from the bookings table
    const [bookings] = await promisePool.execute(`
      SELECT r.* FROM rooms r
      JOIN bookings b ON r.id = b.roomId
      WHERE b.userId = ?`, [userId]);

    if (bookings.length > 0) {
      console.log('Rooms found for user:', bookings);
      res.json(bookings);
    } else {
      console.log('No rooms found for user ID:', userId);
      res.status(404).json({ message: "No rooms booked by this user" });
    }
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    res.status(500).json({ message: "Error fetching user rooms", error: error.message });
  }
});

// Route to get all available rooms
router.get('/available', async (req, res) => {
  try {
    // Fetch rooms that are available (rooms where isAvailable = true)
    const [rooms] = await promisePool.execute('SELECT * FROM rooms WHERE isAvailable = 1');
    console.log('Fetching available rooms:', rooms);
    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Error fetching rooms", error: error.message });
  }
});

// Route to fetch a specific room by ID
router.get('/:id', async (req, res) => {
  const roomId = req.params.id;
  console.log('Fetching room with ID:', roomId);

  try {
    const [room] = await promisePool.execute('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (room.length > 0) {
      console.log('Room found:', room[0]);
      res.json(room[0]);
    } else {
      console.log('Room not found for ID:', roomId);
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).json({ message: "Error fetching room details", error: error.message });
  }
});

// Route to book a room
router.post('/book/:id', async (req, res) => {
  const roomId = req.params.id;
  const { userId, checkInDate, checkOutDate, paymentMethod, phoneNumber, totalAmount } = req.body;

  try {
    // Check if the room is available
    const [roomCheck] = await promisePool.execute('SELECT isAvailable FROM rooms WHERE id = ?', [roomId]);
    if (!roomCheck[0] || !roomCheck[0].isAvailable) {
      return res.status(400).json({ message: "Room is not available" });
    }

    // Create a booking entry in the bookings table
    const [result] = await promisePool.execute(`
      INSERT INTO bookings (userId, roomId, checkInDate, checkOutDate, status, paymentMethod, phoneNumber, totalAmount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
      [userId, roomId, checkInDate, checkOutDate, 'Booked', paymentMethod, phoneNumber, totalAmount]);

    // Update room availability to false after booking
    await promisePool.execute('UPDATE rooms SET isAvailable = 0 WHERE id = ?', [roomId]);

    res.status(200).json({ message: "Room booked successfully", bookingId: result.insertId });
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).json({ message: "Error booking room", error: error.message });
  }
});

module.exports = router;
