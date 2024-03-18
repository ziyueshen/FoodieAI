const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Chat = require("../models/chat");
const passport = require("passport");
const jwt = require('jsonwebtoken');
const { Client } = require("@googlemaps/google-maps-services-js");
const secretKey = process.env.secretKey;
const map_key = process.env.mapKey;
const AIkey = process.env.AIkey;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const LocalStrategy = require('passport-local');

let message_list = [];

const app = express();
const { openai, client, dbUrl, store } = require('../app');
console.log('dbUrl:', dbUrl);
const sessionConfig = {
    store,
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());

router.use(session(sessionConfig));
router.use(passport.initialize());
router.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser((user, done) => {
    console.log('Serializing user:', user);
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      if (err) {
        console.error('Error during deserialization:', err);
        return done(err);
      }
      done(null, user);
    });
  });


router.get("/hi", (req, res) => {
    res.send("hi");
})

router.post("/register", async (req, res) => {
    try {
        const newUser = new User({
            username: req.body.username
        });
        const registeredUser = await User.register(newUser, req.body.password);
        res.status(201).json(registeredUser);
    } catch (error) {
        console.log(error);
        if (error.message.includes('given username')) {
            res.status(500).json({ error: 'Username already exists' });
        } else {
            res.status(500).json({ error: 'Unknown error' });
        }
    }
})

router.post('/login', passport.authenticate('local'), (req, res) => {
    // 登录成功，返回token
    const token = jwt.sign({ username: req.body.username }, secretKey, { expiresIn: '3h' });

    // 设置 Cookie
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    // 返回认证令牌给前端
    res.json({ token });
});

// 中间件用于解析认证令牌
const authenticateToken = (req, res, next) => {
    // 从请求头中提取认证令牌
    const authToken = req.headers.authorization?.split(' ')[1];

    // 如果没有认证令牌，返回未授权错误
    if (!authToken) {
      return res.status(401).json({ message: 'No token, Unauthorized' });
    }
  
    // 解析认证令牌
    jwt.verify(authToken, secretKey, (err, decoded) => {
      if (err) {
        // 认证失败，返回错误响应
        return res.status(401).json({ message: 'Failed in authorization, Unauthorized' });
      }
  
      // 认证成功，将用户信息附加到请求对象中，以便后续处理中使用
      req.user = decoded;
      next();
    });
  }; 

  // 通过中间件验证认证令牌
router.get('/user', authenticateToken, (req, res) => {
    // 认证通过，req.user 中包含用户信息
    res.json({ userId: req.user.userId, loggedIn: true } || null);
  });

// 登出路由
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
}); 

router.post('/messages', authenticateToken, async (req, res) => {
    if (!req.user) {
        return res.status(401).send('User not logged in');
    }
    console.log(req.user);
    console.log(req.body);
    const chat = new Chat({
        userId: req.user.username,
        query: req.body.query,
        messages: req.body.messages,
        timestamp: req.body.timestamp
    });
    try {
        await chat.save();
        console.log('Chat saved');
        res.json({ success: true }); // 发送 JSON 响应，包含一个布尔值 true
    } catch (error) {
        console.error('Error saving chat:', error);
        res.status(500).send('Failed to save chat');
    }
});



router.get("/history", authenticateToken, async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user.username });
        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;