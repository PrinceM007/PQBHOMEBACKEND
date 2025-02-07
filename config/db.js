const mysql = require('mysql2');
require('dotenv').config();

// Create the database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Enable promise support
const promisePool = pool.promise();

// Function to connect to the database (if needed)
const connectDB = () => {
  // You can simply test a query to confirm the connection works.
  promisePool.query("SELECT 1")  
    .then(() => {
      console.log("Connected to the database");
    })
    .catch(err => {
      console.error("Error connecting to the database:", err);
      process.exit(1);  // Exit the app if the DB connection fails
    });
}; 

// Export the promise-enabled pool for use in queries
module.exports = { connectDB, promisePool };
