const express = require('express');
const Staff = require('../models/Staff'); // Ensure the path is correct
const router = express.Router();

// API endpoint to fetch all staff members
router.get('/api/staff', async (req, res) => {
  try {
    const staffMembers = await Staff.getAllStaff();
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff data', error });
  }
});

// API endpoint to fetch a staff member by ID
router.get('/api/staff/:id', async (req, res) => {
  try {
    const staffMember = await Staff.getStaffById(req.params.id);
    if (staffMember) {
      res.json(staffMember);
    } else {
      res.status(404).json({ message: 'Staff member not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff member', error });
  }
});

module.exports = router;
