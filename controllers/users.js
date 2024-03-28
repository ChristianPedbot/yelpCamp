const passport = require('passport');
const bcrypt = require('bcryptjs');
const connection = require('../utils/db');

module.exports.login = (req, res) => {
    res.render('login', { message: req.flash('error') });
}

module.exports.authenticated = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', 'Invalid username and/or passwords');
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Login successful!');
            return res.redirect('/campgrounds');
        });
    })(req, res, next);
}

module.exports.register = (req, res) => {
    res.render('register'); 
}

module.exports.insertUser = async (req, res) => {
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
}

module.exports.logout = (req, res) => {
    req.logout(function(err) {
        if (err) {
            req.flash('error', 'Something went wrong with your logout')
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}