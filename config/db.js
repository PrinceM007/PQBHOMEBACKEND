const mysql = require('mysql2');
require('dotenv').config();

// Create the database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // Use the correct host from Render
  user: process.env.DB_USER,         // Use your database username
  password: process.env.DB_PASSWORD, // Use your database password
  database: process.env.DB_NAME,     // Use your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // Set a connection timeout of 10 seconds
});

// Enable promise support
const promisePool = pool.promise();

// Function to connect to the database (if needed)
const connectDB = async () => {
  try {
    // Test the connection with a simple query
    await promisePool.query("SELECT 1");
    console.log("Connected to the database");
  } catch (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);  // Exit the app if the DB connection fails
  }
};

// Export the promise-enabled pool and connectDB function for use in queries
module.exports = { connectDB, promisePool };
