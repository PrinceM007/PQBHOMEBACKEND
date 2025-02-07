const express = require('express');
const { promisePool } = require('../config/db'); // Database connection
const nodemailer = require('nodemailer'); // Email sending library
const router = express.Router();
require('dotenv').config(); // Ensure .env variables are loaded

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Replace with your SMTP provider
  auth: {
    user: process.env.EMAIL_USER, // Sender email address
    pass: process.env.EMAIL_PASS, // Email password or app-specific password
  },
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection failed:', error);
  } else {
    console.log('SMTP connection successful:', success);
  }
});

// Route to handle checking out a room
router.post('/checkout/:bookingId', async (req, res) => {
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

router.post('/book', async (req, res) => {
  console.log('Incoming request body:', req.body);

  const { userId, roomId, checkInDate, checkOutDate, paymentMethod, phoneNumber, totalAmount } = req.body;

  if (!userId || !roomId || !checkInDate || !checkOutDate || !paymentMethod || !totalAmount) {
    console.log('Missing required fields:', { userId, roomId, checkInDate, checkOutDate, paymentMethod, totalAmount });
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    console.log('Validating user...');
    const [userResult] = await promisePool.query("SELECT email FROM users WHERE id = ?", [userId]);
    if (!userResult.length) {
      return res.status(404).json({ message: "User not found" });
    }
    const userEmail = userResult[0].email;

    console.log('Checking room availability...');
    const [existingBookings] = await promisePool.query(
      `SELECT * FROM bookings WHERE roomId = ? 
       AND NOT (checkInDate >= ? AND checkOutDate <= ?)` ,
      [roomId, checkOutDate, checkInDate]
    );
    console.log('Room availability result:', existingBookings);

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: "Room is not available for the selected dates" });
    }

    console.log('Inserting booking...');
    const [bookingResult] = await promisePool.query(
      `INSERT INTO bookings 
       (userId, roomId, checkInDate, checkOutDate, paymentMethod, phoneNumber, totalAmount) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, roomId, checkInDate, checkOutDate, paymentMethod, phoneNumber, totalAmount]
    );

    console.log('Updating room availability...');
    await promisePool.query("UPDATE rooms SET isAvailable = FALSE WHERE id = ?", [roomId]);

    console.log('Sending confirmation email...');
    const mailOptions = {
      from: `"PQB HOMES" <${process.env.EMAIL_USER}>`, // Professional sender format
      to: userEmail,
      subject: 'Booking Confirmation - PQB Homes',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background-color: #003366; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 30px;">PQB HOMES</h1>
            <p style="margin: 0; font-size: 18px;">Your Home Away From Home</p>
          </div>

          <!-- Body -->
          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #003366;">Booking Confirmation</h2>
            <p>Dear Customer,${userId} </p>
            <p> 
              Thank you for choosing <strong>PQB Homes</strong>. Your booking has been successfully confirmed! Below are the details of your stay:
            </p>

            <h3 style="color: #003366;">Booking Details:</h3>
            <ul style="list-style-type: none; padding: 0;">
              <li><strong>Booking Reference:</strong> #${bookingResult.insertId}</li>
              <li><strong>Check-in Date:</strong> ${checkInDate}</li>
              <li><strong>Check-out Date:</strong> ${checkOutDate}</li>
              <li><strong>Guests:</strong> 1 Adult</li> <!-- Modify guests count if necessary -->
              <li><strong>WIFI PASSWORD:</strong> pqbhomes@1234</li>
              <li><strong>Total Amount:</strong> $${totalAmount}</li>
            </ul>
            <p style="margin-top: 20px;">
              If you have any questions or need assistance, feel free to contact us at any time. We're here to make your stay unforgettable.
            </p>
            <p style="margin-top: 20px; font-size: 14px;">
              Best regards,<br>
              <strong>PQB Homes Team</strong><br>
              <a href="mailto:reservation@pqbhomes.com" style="color: #003366; text-decoration: none;">reservation@pqbhomes.com</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #6c757d;">
            <p style="margin: 0;">© 2024 PQB Homes. All Rights Reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "Booking successful and email sent!" });
  } catch (error) {
    console.error('Error during booking process:', error);
    res.status(500).json({ message: "Server error during booking process", error: error.message });
  }
});

module.exports = router;
