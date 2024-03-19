const express = require('express');
const router = express.Router();
const passport = require('passport');
const users = require('../controllers/users');
const { authenticateToken } = require('../middleware');

router.post('/register', users.register);
// router.post('/login', passport.authenticate('local'), users.login);
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    console.log('passport authenticating');
    if (err) {
      // 如果发生错误，将错误信息记录到日志中
      console.error('Error during login:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (!user) {
      // 如果用户不存在，返回错误信息给客户端
      return res.status(401).json({ error: info.message });
    }
    // 用户登录成功，调用用户登录处理函数
    console.log('passport success');
    users.login(req, res, user);
  })(req, res, next);
});

router.get('/user', authenticateToken, users.user);
router.get('/logout', users.logout);

module.exports = router;
