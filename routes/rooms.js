const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/db');

// Route to get all available rooms
router.get('/', async (req, res) => {
  try {
    const [rooms] = await promisePool.execute('SELECT * FROM rooms');
    console.log('Fetching all rooms:', rooms);
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

// Route to book a room and set its availability to false (Not Available)
router.post('/book/:id', async (req, res) => {
  const roomId = req.params.id;

  try {
    // Update room availability to false
    const [result] = await promisePool.execute('UPDATE rooms SET isAvailable = 0 WHERE id = ?', [roomId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Room booked successfully" });
    } else {
      res.status(404).json({ message: "Room not found or already booked" });
    }
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).json({ message: "Error booking room", error: error.message });
  }
});

// Route to get all rooms booked by a user (current and past bookings)
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log('Fetching rooms booked by user:', userId);

  try {
    const [bookings] = await promisePool.execute(`
      SELECT r.* 
      FROM rooms r
      JOIN bookings b ON r.id = b.roomId
      WHERE b.userId = ?`, [userId]);

    if (bookings.length > 0) {
      res.json(bookings);
    } else {
      res.status(404).json({ message: "No rooms booked by this user" });
    }
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    res.status(500).json({ message: "Error fetching user rooms", error: error.message });
  }
});

// Route to handle checking out a room
router.post('/bookings/checkout/:bookingId', async (req, res) => {
  const bookingId = req.params.bookingId;

  try {
    // Update the booking's availability to 1 (checked out)
    const [result] = await promisePool.execute('UPDATE rooms SET isAvailable = 1 WHERE id = ?', [bookingId]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Checked out successfully' });
    } else {
      res.status(404).json({ message: 'Booking not found or already checked out' });
    }
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({ message: 'Error checking out the room', error: error.message });
  }
});


module.exports = router;
