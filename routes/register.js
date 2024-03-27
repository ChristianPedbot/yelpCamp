const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

const connection = require('../utils/db');

router.get('/', (req, res) => {
    res.render('register'); 
});

router.post('/', async (req, res) => {
    const { username,email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query('INSERT INTO users (username ,email, password) VALUES (?, ?, ?)', [username ,email, hashedPassword]);
        req.flash('success', 'User registered successfully!');
        res.redirect('/login'); 
    } catch (error) {
        req.flash('error', 'Error during registration. Please try again.');
        res.redirect('/register'); 
    }
});

module.exports = router;
