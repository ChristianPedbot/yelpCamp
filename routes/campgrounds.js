const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const methodOverride = require('method-override');
router.use(methodOverride('_method'));

const connection = require('../utils/db');

router.get('/new', (req , res) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in ');
        return res.redirect('/login');
    }
    res.render('new');
});

router.get('/register', (req, res) => {
    res.redirect('/users/register');
});

router.get('/', (req, res) => {
    connection.query('SELECT * FROM campgrounds', (error, results) => {
        if (error) {
            req.flash('error', 'Error when searching for campgrounds.');
            return res.redirect('/campgrounds');
        }
        if (!results || results.length === 0) {
            req.flash('error', 'No campgrounds found.');
            return res.redirect('/campgrounds');
        }
        res.render('index', { campgrounds: results });
    });
});

router.post('/', (req, res) => {
    const { title, price, description, location, image } = req.body.campground; 
    connection.query('INSERT INTO campgrounds (title, price, description,  location, image) VALUES (?, ?, ?, ?, ?)', [title, price, description, location, image], (error, results) => {
        if (error) {
            req.flash('error', 'Error when inserting new campground:');
            return res.redirect('/campgrounds');
        }
        req.flash('success', 'New campground successfully inserted.');
        res.redirect('/campgrounds'); 
    });
});

router.post('/:id/review', (req, res) => {
    const campgroundId = req.params.id;
    const { body, rating } = req.body.review;
    

    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in to add a review.');
        return res.redirect('/login');
    }
    
    const userId = req.user ? req.user.id : null;

    connection.query('INSERT INTO review (body, rating, campground_id, user_id) VALUES (?, ?, ?, ?)', 
        [body, rating, campgroundId, userId], 
        (error, results) => {
            if (error) {
                req.flash('error', 'Error inserting new revision.');
                return res.redirect('/campgrounds/' + campgroundId);
            }
            req.flash('success', 'New revision inserted successfully.');
            res.redirect('/campgrounds/' + campgroundId); 
        }
    );
});



router.delete('/:id', (req, res) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in ');
        return res.redirect('/login');
    }
    const campgroundId = req.params.id;
    connection.query('DELETE FROM campgrounds WHERE id = ?', campgroundId, (error, results) => {
        if (error) {
            req.flash('error', 'Error deleting campground.');
            return res.redirect('/campgrounds');
        }
        if (results.affectedRows > 0) {
            req.flash('success', 'Campground successfully deleted.');
        } else {
            req.flash('error', 'Unable to find campground to delete.');
        }
        res.redirect('/campgrounds'); 
    });
});

router.get('/:id', (req, res) => {
    const campgroundId = req.params.id;
    const campgroundQuery = 'SELECT * FROM campgrounds WHERE id = ?';
    const reviewsQuery = 'SELECT * FROM review WHERE campground_id = ?';
    connection.query(campgroundQuery, campgroundId, (error, campgroundResults) => {
        if (error) {
            req.flash('error', 'Error searching for campground.');
            return res.redirect('/campgrounds');
        }
        if (campgroundResults.length === 0) {
            req.flash('error', 'No campgrounds found.');
            return res.redirect('/campgrounds');
        }
        const campground = campgroundResults[0];
        connection.query(reviewsQuery, campgroundId, (error, reviewsResults) => {
            if (error) {
                req.flash('error', 'Error searching for reviews.');
                return res.redirect('/campgrounds/' + campgroundId);
            }
            res.render('show', { campground, reviews: reviewsResults });
        });
    });
});

router.put('/:id', (req, res) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in ');
        return res.redirect('/login');
    }
    const campgroundId = req.params.id;
    const updatedCampground = req.body.campground;
    connection.query('UPDATE campgrounds SET title = ?, price = ?, description = ?, location = ? WHERE id = ?',
        [updatedCampground.title, updatedCampground.price, updatedCampground.description, updatedCampground.location, campgroundId],
        (error, results) => {
            if (error) {
                req.flash('error', 'Error updating campground:');
                return res.redirect('/campgrounds/' + campgroundId);
            }
            req.flash('success', 'Campground updated successfully..');
            res.redirect('/campgrounds/' + campgroundId);  
        }
    );
});

router.get('/:id/edit', (req, res) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in ');
        return res.redirect('/login');
    }
    const campgroundId = req.params.id;
    connection.query('SELECT * FROM campgrounds WHERE id = ?', campgroundId, (error, results) => {
        if (error) {
            req.flash('error', 'Error when searching for the campground.');
            return res.redirect('/campgrounds');
        }
        if (!results || results.length === 0) {
            req.flash('error', 'Campground not found.');
            return res.redirect('/campgrounds');
        }
        res.render('edit', { campground: results[0] }); 
    });
});

module.exports = router;
