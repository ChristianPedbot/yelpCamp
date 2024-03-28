const express = require('express');
const router = express.Router(); 
const reviewController = require('../controllers/reviews')

router.delete('/:id', reviewController.delete);

module.exports = router;
