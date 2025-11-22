const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());


// --------------------------------------------------------
// SERVE FRONTEND (index.html inside backend/public folder)
// --------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// --------------------------------------------------------
// DATABASE CONNECTION
// --------------------------------------------------------
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "28756@suvarna",
    database: "disasterdb"
});

db.connect((err) => {
    if (err) {
        console.log("❌ MySQL Connection Failed:", err);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});


// --------------------------------------------------------
// CREATE TABLE IF NOT EXISTS
// --------------------------------------------------------
const createTableQuery = `
CREATE TABLE IF NOT EXISTS emergencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Reported'
)
`;

db.query(createTableQuery, (err) => {
    if (err) console.log("❌ Table creation failed:", err);
    else console.log("✅ Table ready");
});


// --------------------------------------------------------
// POST: ADD EMERGENCY
// --------------------------------------------------------
app.post("/api/emergencies", (req, res) => {
    const { title, description, location, category } = req.body;

    const sql = `INSERT INTO emergencies (title, description, location, category)
                 VALUES (?, ?, ?, ?)`;

    db.query(sql, [title, description, location, category], (err) => {
        if (err) {
            return res.status(500).json({ message: "Error reporting emergency", error: err });
        }

        res.json({ message: "Emergency reported successfully!" });
    });
});


// --------------------------------------------------------
// GET: FETCH ALL EMERGENCIES
// --------------------------------------------------------
app.get("/api/emergencies", (req, res) => {
    db.query("SELECT * FROM emergencies", (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching emergencies", error: err });
        }

        res.json(results);
    });
});


// --------------------------------------------------------
// PATCH: UPDATE STATUS
// --------------------------------------------------------
app.patch("/api/emergencies/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const sql = `UPDATE emergencies SET status = ? WHERE id = ?`;

    db.query(sql, [status, id], (err) => {
        if (err) {
            return res.status(500).json({ message: "Error updating status", error: err });
        }

        res.json({ message: "Status updated successfully!" });
    });
});


// --------------------------------------------------------
// START SERVER
// --------------------------------------------------------
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});
