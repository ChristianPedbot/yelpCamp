const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');

const connection = require('../utils/db');

router.use(require('express-session')({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

router.use(passport.initialize());
router.use(passport.session());
router.use(flash());

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
(email, password, done) => {
    connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            return done(error);
        }

        if (results.length === 0) {
            return done(null, false, { message: 'Incorrect email.' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, passwordMatch) => {
            if (err) {
                return done(err);
            }

            if (passwordMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    connection.query('SELECT * FROM users WHERE id = ?', [id], (error, results) => {
        if (error) {
            return done(error);
        }
        
        const user = results[0];
        done(null, user);
    });
});

module.exports = router;
