// Express-API für Officers
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'klo'
};

// Alle Officers abrufen
router.get('/', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM officers');
  await conn.end();
  res.json(rows);
});

// Officer anlegen
router.post('/', async (req, res) => {
  const { id, badge_number, first_name, last_name, phone_number, gender, rank } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO officers (id, badge_number, first_name, last_name, phone_number, gender, rank) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, badge_number, first_name, last_name, phone_number, gender, rank]);
  await conn.end();
  res.json({ success: true });
});

// Officer aktualisieren
router.put('/:id', async (req, res) => {
  const { badge_number, first_name, last_name, phone_number, gender, rank } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('UPDATE officers SET badge_number=?, first_name=?, last_name=?, phone_number=?, gender=?, rank=? WHERE id=?', [badge_number, first_name, last_name, phone_number, gender, rank, req.params.id]);
  await conn.end();
  res.json({ success: true });
});

// Officer löschen
router.delete('/:id', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM officers WHERE id=?', [req.params.id]);
  await conn.end();
  res.json({ success: true });
});

module.exports = router;
