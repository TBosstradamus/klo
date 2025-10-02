// Express-API für ITLogs
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'klo'
};

// Alle ITLogs abrufen
router.get('/', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM itlogs');
  await conn.end();
  res.json(rows);
});

// ITLog anlegen
router.post('/', async (req, res) => {
  const { id, event_type, officer_id, description, created_at } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO itlogs (id, event_type, officer_id, description, created_at) VALUES (?, ?, ?, ?, ?)', [id, event_type, officer_id, description, created_at]);
  await conn.end();
  res.json({ success: true });
});

// ITLog aktualisieren
router.put('/:id', async (req, res) => {
  const { event_type, officer_id, description } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('UPDATE itlogs SET event_type=?, officer_id=?, description=? WHERE id=?', [event_type, officer_id, description, req.params.id]);
  await conn.end();
  res.json({ success: true });
});

// ITLog löschen
router.delete('/:id', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM itlogs WHERE id=?', [req.params.id]);
  await conn.end();
  res.json({ success: true });
});

module.exports = router;
