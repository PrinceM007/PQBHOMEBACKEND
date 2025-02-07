const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const mailOptions = {
  from: `"PQB HOMES" <${process.env.EMAIL_USER}>`, // Professional sender format
  to: 'noncedonceshshabangu@gmail.com', // Replace with recipient's email
  subject: 'Booking Confirmation - PQB Homes',
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #007BFF; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">PQB HOMES</h1>
        <p style="margin: 0; font-size: 18px;">Your Home Away From Home</p>
      </div>
      <div style="padding: 20px; background-color: #ffffff;">
        <h2 style="color: #007BFF;">Booking Confirmation</h2>
        <p>Dear Banele,</p>
        <p> 
          Thank you for choosing <strong>PQB Homes</strong>. Your booking has been successfully confirmed! Below are the details of your stay:
        </p>
        <h3 style="color: #333;">Booking Details:</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Booking Reference:</strong> #123456</li>
          <li><strong>Check-in Date:</strong> December 4, 2024</li>
          <li><strong>Check-out Date:</strong> December 5, 2024</li>
          <li><strong>Guests:</strong> 2 Adults</li>
          <li><strong>WIFI PASSWORD:</strong>pqbhomes@1234 </li>
          <li><strong>Total Amount:</strong> $200</li>
        </ul>
        <p style="margin-top: 20px;">
          If you have any questions or need assistance, feel free to contact us at any time. We're here to make your stay unforgettable.
        </p>
        <p style="margin-top: 20px; font-size: 14px;">
          Best regards,<br>
          <strong>PQB Homes Team</strong><br>
          <a href="mailto:reservation@pqbhomes.com" style="color: #007BFF; text-decoration: none;">reservation@pqbhomes.com</a><br>
          
        </p>
      </div>
      <div style="background-color: #f8f9fa; padding: 10px; text-align: center; font-size: 12px; color: #6c757d;">
        <p style="margin: 0;">© 2024 PQB Homes. All Rights Reserved.</p>
      </div>
    </div>
  `,
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});
