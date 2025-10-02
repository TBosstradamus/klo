// Express-API für Module
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'klo'
};

// Alle Module abrufen
router.get('/', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM modules');
  await conn.end();
  res.json(rows);
});

// Modul anlegen
router.post('/', async (req, res) => {
  const { id, name, description } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO modules (id, name, description) VALUES (?, ?, ?)', [id, name, description]);
  await conn.end();
  res.json({ success: true });
});

// Modul aktualisieren
router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('UPDATE modules SET name=?, description=? WHERE id=?', [name, description, req.params.id]);
  await conn.end();
  res.json({ success: true });
});

// Modul löschen
router.delete('/:id', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM modules WHERE id=?', [req.params.id]);
  await conn.end();
  res.json({ success: true });
});

module.exports = router;
