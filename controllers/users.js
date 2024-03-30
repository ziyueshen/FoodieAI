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
    try {
        const token = jwt.sign({ username: req.body.username }, secretKey, { expiresIn: '10h' });

        // return token
        res.json({ token });
        console.log('login success');
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Unknown error' });
    }
}

// auth user by middleware
module.exports.user = (req, res) => {
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
            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Unknown error' });
    }
}