const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

pool.getConnection((err, connection) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("MySQL Database Connected Successfully");
        connection.release();
    }
});

module.exports = pool.promise();