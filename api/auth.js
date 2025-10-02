const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const router = express.Router();

// Dummy: In Produktion aus DB laden!
const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('admin', 10),
    roles: ['Admin'],
    rank: 'Chief of Police',
    departmentRoles: ['Admin']
  }
];

router.use(session({
  secret: 'klo-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'User not found' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });
  req.session.user = {
    id: user.id,
    username: user.username,
    roles: user.roles,
    rank: user.rank,
    departmentRoles: user.departmentRoles
  };
  res.json({
    id: user.id,
    username: user.username,
    roles: user.roles,
    rank: user.rank,
    departmentRoles: user.departmentRoles
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Session-Check
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

module.exports = router;
