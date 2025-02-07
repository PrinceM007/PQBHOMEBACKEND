const bcrypt = require('bcrypt');
const pool = require('../config/db'); // Ensure this path is correct


async function addUser(fullName, email, username, plainPassword) {
    
    try {
        // Check if the username already exists
        const [existingUser] = await pool.promise().query(
            "SELECT * FROM users WHERE username = ? OR email = ?", 
            [username, email]
        );
        if (existingUser.length > 0) {
            return { message: 'Username or Email already in use' };
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Insert new user into the database
        await pool.promise().query(
            "INSERT INTO users (fullName, email, username, password, createdAt) VALUES (?, ?, ?, ?, NOW())",
            [fullName, email, username, hashedPassword]
        );
        console.log(`User ${username} added.`);
        return { message: 'User successfully added' };
    } catch (error) {
        console.error('Error adding user:', error);
        return { message: 'Error adding user', error };
    }
}

module.exports = {
    addUser,
};
