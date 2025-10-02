// Express-API für Mailbox (E-Mails)
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'klo'
};

// Alle Mails abrufen
router.get('/', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM mailbox');
  await conn.end();
  res.json(rows);
});

// Mail anlegen
router.post('/', async (req, res) => {
  const { id, from_addr, to_addr, subject, body, sent_at } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO mailbox (id, from_addr, to_addr, subject, body, sent_at) VALUES (?, ?, ?, ?, ?, ?)', [id, from_addr, to_addr, subject, body, sent_at]);
  await conn.end();
  res.json({ success: true });
});

// Mail löschen
router.delete('/:id', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM mailbox WHERE id=?', [req.params.id]);
  await conn.end();
  res.json({ success: true });
});

module.exports = router;
