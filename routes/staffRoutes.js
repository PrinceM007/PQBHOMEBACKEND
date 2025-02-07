// routes/staff.js

const express = require('express');
const staffController = require('../controllers/staffController'); // Import controller
const router = express.Router();

// Define the routes related to staff
router.get('/api/staff', staffController.getStaff);            // Get staff data
router.put('/api/staff/:id', staffController.updateRole);     // Update staff role

module.exports = router;
