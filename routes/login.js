require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

router.get('/', (req, res) => {
    if (req.query.fail){
        res.render('login', {message: 'Usuario e/ou senha invalidos'});
    }
    else
        res.render('login', {message: null});
});

router.post('/', passport.authenticate('local',{
    successRedirect: '/campgrounds',
}))

module.exports = router;