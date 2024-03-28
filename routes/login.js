const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

router.get('/', usersController.login);

router.post('/', usersController.authenticated);

module.exports = router;
