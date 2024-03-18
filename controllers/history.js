const Chat = require("../models/chat");

module.exports.messages = async (req, res) => {
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
}

module.exports.history = async (req, res) => {
    try {
        const chats = await Chat.find({ userId: req.user.username });
        res.json(chats);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
}