const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

router.post('/', (req, res, next) => {
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
});

module.exports = router;
