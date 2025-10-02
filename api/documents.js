// Express-API für Documents
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'klo'
};

// Alle Dokumente abrufen
router.get('/', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM documents');
  await conn.end();
  res.json(rows);
});

// Dokument anlegen
router.post('/', async (req, res) => {
  const { id, title, content, created_at } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO documents (id, title, content, created_at) VALUES (?, ?, ?, ?)', [id, title, content, created_at]);
  await conn.end();
  res.json({ success: true });
});

// Dokument aktualisieren
router.put('/:id', async (req, res) => {
  const { title, content } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('UPDATE documents SET title=?, content=? WHERE id=?', [title, content, req.params.id]);
  await conn.end();
  res.json({ success: true });
});

// Dokument löschen
router.delete('/:id', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM documents WHERE id=?', [req.params.id]);
  await conn.end();
  res.json({ success: true });
});

module.exports = router;
