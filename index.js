const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

app.get('/', (req, res) => {
  res.json({ message: 'API is running inside Docker!' });
});

app.get('/users', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
    await pool.query(`
      INSERT INTO users (name)
      SELECT unnest(ARRAY['Alice', 'Bob', 'Charlie'])
      WHERE NOT EXISTS (SELECT 1 FROM users)
    `);
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
