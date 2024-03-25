const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const { handleQueryError, handleNoResults } = require('../app');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

router.get('/register', (req, res) => {
    res.render('register');
});

module.exports = router;
