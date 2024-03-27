const express = require('express');
const router = express.Router(); 
const mysql = require('mysql');

const connection = require('../utils/db');

router.delete('/:id', (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    const reviewId = req.params.id; 
    const userId = req.user.id; 
    connection.query('SELECT user_id FROM review WHERE id = ?', reviewId, (error, results) => {
        if (error) {
            req.flash('error', 'Error deleting review.');
            return res.redirect('back'); 
        }
        if (results.length === 1 && results[0].user_id === userId) {
            connection.query('DELETE FROM review WHERE id = ?', reviewId, (error, results) => {
                if (error) {
                    req.flash('error', 'Error deleting review.');
                    return res.redirect('back'); 
                }
                req.flash('success', 'Review successfully removed.');
                res.redirect('back'); 
            });
        } else { 
            req.flash('error', 'You are not authorized to delete this review.');
            res.redirect('back');
        }
    });
});

module.exports = router;
