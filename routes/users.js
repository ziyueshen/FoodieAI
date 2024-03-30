const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const { authenticateToken } = require('../middleware');

router.post('/register', users.register);

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log('passport authenticating');
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    console.log('passport success');
    users.login(req, res, user);
  })(req, res, next);
});

router.get('/user', authenticateToken, users.user);
router.get('/logout', users.logout);

module.exports = router;
