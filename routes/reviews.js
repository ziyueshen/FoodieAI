const express = require('express');
const router = express.Router();
const reviews = require('../controllers/reviews');

router.route('/sum')
    .post(reviews.sum)

router.route('/ask')
    .post(reviews.ask)

module.exports = router;