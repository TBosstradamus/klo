// Express-API für Vehicles
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'klo'
};

// Alle Fahrzeuge abrufen
router.get('/', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM vehicles');
  await conn.end();
  res.json(rows);
});

// Fahrzeug anlegen
router.post('/', async (req, res) => {
  const { id, name, category, capacity, license_plate, mileage } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO vehicles (id, name, category, capacity, license_plate, mileage) VALUES (?, ?, ?, ?, ?, ?)', [id, name, category, capacity, license_plate, mileage]);
  await conn.end();
  res.json({ success: true });
});

// Fahrzeug aktualisieren
router.put('/:id', async (req, res) => {
  const { name, category, capacity, license_plate, mileage } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('UPDATE vehicles SET name=?, category=?, capacity=?, license_plate=?, mileage=? WHERE id=?', [name, category, capacity, license_plate, mileage, req.params.id]);
  await conn.end();
  res.json({ success: true });
});

// Fahrzeug löschen
router.delete('/:id', async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM vehicles WHERE id=?', [req.params.id]);
  await conn.end();
  res.json({ success: true });
});

module.exports = router;
