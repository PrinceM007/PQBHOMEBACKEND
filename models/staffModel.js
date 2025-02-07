const db = require('../config');

// Get all staff members
const getAllStaff = async () => {
  const [rows] = await db.execute('SELECT * FROM staff');
  return rows;
};

// Get a staff member by ID
const getStaffById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM staff WHERE id = ?', [id]);
  return rows[0];
};

// Update staff member's role
const updateStaffRole = async (id, role) => {
  const [result] = await db.execute('UPDATE staff SET role = ? WHERE id = ?', [role, id]);
  return result;
};

module.exports = {
  getAllStaff,
  getStaffById,
  updateStaffRole,
};
