// Express-API für OfficerChecklists
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'klo'
};

// Alle Checklisten abrufen
router.get('/', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM officer_checklists');
  await conn.end();
  res.json(rows);
});

// Checklist anlegen
router.post('/', async (req, res) => {
  const { id, officer_id, items, is_completed } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO officer_checklists (id, officer_id, items, is_completed) VALUES (?, ?, ?, ?)', [id, officer_id, JSON.stringify(items), is_completed]);
  await conn.end();
  res.json({ success: true });
});

// Checklist aktualisieren
router.put('/:id', async (req, res) => {
  const { officer_id, items, is_completed } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('UPDATE officer_checklists SET officer_id=?, items=?, is_completed=? WHERE id=?', [officer_id, JSON.stringify(items), is_completed, req.params.id]);
  await conn.end();
  res.json({ success: true });
});

// Checklist löschen
router.delete('/:id', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM officer_checklists WHERE id=?', [req.params.id]);
  await conn.end();
  res.json({ success: true });
});

module.exports = router;
