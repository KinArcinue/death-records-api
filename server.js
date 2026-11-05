require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");






const express = require("express");
const Database = require("better-sqlite3");

const app = express();
const db = new Database("death_records.db");

app.use(express.json());


db.exec(`
  CREATE TABLE IF NOT EXISTS death_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    date_of_death TEXT NOT NULL,
    place_of_death TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

app.use("/api/death-records", authenticateToken);

app.get("/api/death-records", (req, res) => {
  const records = db.prepare(
    "SELECT * FROM death_records"
  ).all();

  res.json(records);
});


app.get("/api/death-records/:id", (req, res) => {
  const record = db.prepare(
    "SELECT * FROM death_records WHERE id = ?"
  ).get(req.params.id);

  if (!record) {
    return res.status(404).json({
      message: "Record not found"
    });
  }

  res.json(record);
});


app.post("/api/death-records", (req, res) => {
  const { full_name, date_of_death, place_of_death } = req.body;

  if (!full_name || !date_of_death) {
    return res.status(400).json({
      message: "Name and date of death are required"
    });
  }

  const result = db.prepare(`
    INSERT INTO death_records
    (full_name, date_of_death, place_of_death)
    VALUES (?, ?, ?)
  `).run(full_name, date_of_death, place_of_death || null);

  res.status(201).json({
    message: "Record added successfully",
    id: result.lastInsertRowid
  });
});


app.put("/api/death-records/:id", (req, res) => {
  const { full_name, date_of_death, place_of_death } = req.body;

  const result = db.prepare(`
    UPDATE death_records
    SET full_name = ?, date_of_death = ?, place_of_death = ?
    WHERE id = ?
  `).run(
    full_name,
    date_of_death,
    place_of_death || null,
    req.params.id
  );

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Record not found"
    });
  }

  res.json({ message: "Record updated successfully" });
});


app.delete("/api/death-records/:id", (req, res) => {
  const result = db.prepare(
    "DELETE FROM death_records WHERE id = ?"
  ).run(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({
      message: "Record not found"
    });
  }

  res.json({ message: "Record deleted successfully" });
});

app.post("/api/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters"
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    db.prepare(
      "INSERT INTO users (username, password) VALUES (?, ?)"
    ).run(username, hashedPassword);

    res.status(201).json({
      message: "User registered successfully"
    });
  } catch (error) {
    res.status(400).json({
      message: "Username already exists"
    });
  }
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  const user = db.prepare(
    "SELECT * FROM users WHERE username = ?"
  ).get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({
      message: "Invalid username or password"
    });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    token: token
  });
});


// Middleware - Verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied. Token required."
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token"
      });
    }

    req.user = user;
    next();
  });
}

app.listen(3000, () => {
  console.log("API running at http://localhost:3000");
});