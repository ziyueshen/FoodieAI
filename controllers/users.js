const User = require("../models/user");
const jwt = require('jsonwebtoken');

const secretKey = process.env.secretKey;

module.exports.register = async (req, res) => {
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
}

module.exports.login = (req, res) => {
    // 登录成功，返回token
    try {
        const token = jwt.sign({ username: req.body.username }, secretKey, { expiresIn: '3h' });

        // 设置 Cookie
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // 返回认证令牌给前端
        res.json({ token });
        console.log('login success');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Unknown error' });
    }
}

// 通过中间件验证认证令牌
module.exports.user = (req, res) => {
    // 认证通过，req.user 中包含用户信息
    res.json({ userId: req.user.userId, loggedIn: true } || null);
}

module.exports.logout = (req, res, next) => {
    try {
        req.logout(function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to logout' });
                return;
            }
            // 在这里处理注销成功后的逻辑
            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Unknown error' });
    }

    // req.logout(function (err) {
    //     if (err) {
    //         return next(err);
    //     }
    //     res.redirect('/');
    // });
}