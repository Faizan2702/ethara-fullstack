const mysql = require('mysql2/promise');

async function fixDatabase() {
  const DB_URL = "mysql://root:dnDQbXhTCyTjMaAqIlGfoazUrDMojVwK@switchyard.proxy.rlwy.net:59462/railway";
  const pool = mysql.createPool(DB_URL);
  
  try {
    console.log("1. Deleting old tables...");
    await pool.query(`DROP TABLE IF EXISTS evaluations, tasks, projects, users;`);

    console.log("2. Building new, upgraded tables...");
    
    await pool.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Member'
      )
    `);

    await pool.query(`
      CREATE TABLE projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Active',
        progress INT DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        dueDate DATE,
        projectId INT,
        assigneeId INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigneeId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    console.log("✅ Success! Database is completely fixed and ready.");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    pool.end();
  }
}

fixDatabase();