require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Database connection
const db = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const bloodRoutes = require("./routes/bloodRoutes");
const requestRoutes = require("./routes/requestRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/recipients", recipientRoutes);
app.use("/api/blood", bloodRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);


// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        message: "Blood Bank Management System API is working!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});