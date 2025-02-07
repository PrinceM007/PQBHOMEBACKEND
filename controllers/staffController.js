// controllers/staffController.js

const { Staff } = require('../models'); // Make sure you have the Staff model imported

// Controller to fetch all staff
const getStaff = async (req, res) => {
  try {
    const staffMembers = await Staff.findAll(); // Fetch all staff from the DB
    res.json(staffMembers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff data', error: error.message });
  }
};

// Controller to update staff role
const updateRole = async (req, res) => {
  const { id } = req.params; // Get staff ID from URL parameters
  const { role } = req.body; // Get new role from request body
  
  try {
    const staffMember = await Staff.findByPk(id); // Find the staff member by primary key (ID)
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    staffMember.role = role; // Update the role
    await staffMember.save(); // Save the updated staff member

    res.json(staffMember); // Return updated staff data
  } catch (error) {
    res.status(500).json({ message: 'Error updating staff role', error: error.message });
  }
};

module.exports = {
  getStaff,
  updateRole
};
