// ethara-backend/index.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors({
  origin: "https://enchanting-reverence-production-cfa5.up.railway.app/", // Put your frontend link here
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json()); 

const DB_URL = "mysql://root:dnDQbXhTCyTjMaAqIlGfoazUrDMojVwK@switchyard.proxy.rlwy.net:59462/railway";
const pool = mysql.createPool(DB_URL);

//AUTHENTICATION APIs
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role || 'Member']
    );
    res.json({ id: result.insertId, name, email, role });
  } catch (error) {
    res.status(400).json({ error: "Email already exists or invalid data." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length > 0) res.json(rows[0]);
    else res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

//TEAM API
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role FROM users ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

//PROJECT APIs
app.get('/api/projects', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM projects ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

app.post('/api/projects', async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO projects (name, description, status, progress) VALUES (?, ?, ?, ?)',
      [name, description, 'Active', 0]
    );
    res.json({ id: result.insertId, name, description, status: 'Active', progress: 0 });
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

//TASK APIs
app.get('/api/tasks', async (req, res) => {
  try {
    // Advanced SQL JOIN to get the names associated with the IDs
    const [rows] = await pool.query(`
      SELECT t.*, p.name AS projectName, u.name AS assigneeName 
      FROM tasks t
      LEFT JOIN projects p ON t.projectId = p.id
      LEFT JOIN users u ON t.assigneeId = u.id
      ORDER BY t.dueDate ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, projectId, assigneeId, dueDate } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tasks (title, description, projectId, assigneeId, dueDate, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, projectId, assigneeId, dueDate, 'Pending']
    );
    res.json({ id: result.insertId, message: "Task created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: "Task status updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Ethara API running on port ${PORT}`));
