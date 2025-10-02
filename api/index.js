
// Hauptserver für die API
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const mailbox = require('./mailbox');
const auth = require('./auth');
const officers = require('./officers');
const vehicles = require('./vehicles');
const sanctions = require('./sanctions');
const modules = require('./modules');
const documents = require('./documents');
const itlogs = require('./itlogs');
const checklists = require('./checklists');


app.use('/api/auth', auth);
app.use('/api/mailbox', mailbox);
app.use('/api/officers', officers);
app.use('/api/vehicles', vehicles);
app.use('/api/sanctions', sanctions);
app.use('/api/modules', modules);
app.use('/api/documents', documents);
app.use('/api/itlogs', itlogs);
app.use('/api/checklists', checklists);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API Server läuft auf Port ${PORT}`);
});
