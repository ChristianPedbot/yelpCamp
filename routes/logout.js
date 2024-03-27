require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post('/', (req, res) => {
    req.logout(function(err) {
        if (err) {
            req.flash('error', 'Something went wrong with your logout')
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
});


module.exports = router;