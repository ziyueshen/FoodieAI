const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const { authenticateToken } = require('../middleware');

router.post('/register', users.register);
router.post('/login', passport.authenticate('local'), users.login);
router.get('/user', authenticateToken, users.user);
router.get('/logout', users.logout);

module.exports = router;
