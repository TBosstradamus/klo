// Express-API für Sanctions
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'klo'
};

// Alle Sanktionen abrufen
router.get('/', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM sanctions');
  await conn.end();
  res.json(rows);
});

// Sanktion anlegen
router.post('/', async (req, res) => {
  const { id, officer_id, sanction_type, issued_by, timestamp } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO sanctions (id, officer_id, sanction_type, issued_by, timestamp) VALUES (?, ?, ?, ?, ?)', [id, officer_id, sanction_type, issued_by, timestamp]);
  await conn.end();
  res.json({ success: true });
});

// Sanktion aktualisieren
router.put('/:id', async (req, res) => {
  const { officer_id, sanction_type, issued_by, timestamp } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('UPDATE sanctions SET officer_id=?, sanction_type=?, issued_by=?, timestamp=? WHERE id=?', [officer_id, sanction_type, issued_by, timestamp, req.params.id]);
  await conn.end();
  res.json({ success: true });
});

// Sanktion löschen
router.delete('/:id', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM sanctions WHERE id=?', [req.params.id]);
  await conn.end();
  res.json({ success: true });
});

module.exports = router;
