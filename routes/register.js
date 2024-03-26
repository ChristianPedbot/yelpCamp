require('dotenv').config();
const express = require('express');
const router = express.Router();
const mysql = require('mysql');

// Configure your database connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Handle GET request for the registration form
router.get('/', (req, res) => {
    res.render('register'); // Assuming you have a register.ejs file for the registration form
});

// Handle POST request for registering a new user
router.post('/', (req, res) => {
    const { username, email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert the new user into the database
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        connection.query(sql, [username, email, hashedPassword], (error, results) => {
            if (error) {
                console.error('Error registering user:', error);
                return res.status(500).send('Error Registering User');
            }

            console.log('User registered successfully');
            res.redirect('/login'); // Redirect to login page after successful registration
        });
    });
});

module.exports = router;
