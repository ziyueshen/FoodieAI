const express = require('express');
const router = express.Router({ mergeParams: true });
const { authenticateToken } = require('../middleware');

const history = require('../controllers/history');

router.get("/history", authenticateToken, history.history);
router.post('/messages', authenticateToken, history.messages);

module.exports = router;