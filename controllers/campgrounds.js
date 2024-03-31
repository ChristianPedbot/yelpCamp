
const connection = require('../utils/db');

module.exports.new = (req , res) => {
    if(!req.isAuthenticated()){
        req.flash('error', 'You must be signed in ');
        return res.redirect('/login');
    }
    res.render('new');
}

module.exports.registerRedirect = (req, res) => {
    res.redirect('/users/register');
}

module.exports.index = (req, res) => {
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
}

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

module.exports.insertCamp = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            req.flash('error', 'Error uploading image.');
            return res.redirect('/campgrounds/new');
        }

        if (!req.isAuthenticated()) {
            req.flash('error', 'You must be signed in.');
            return res.redirect('/login');
        }

        const userId = req.user.id; 
        const { title, price, description, location } = req.body.campground;

        const image = req.file.path; 

        connection.query(
            'INSERT INTO campgrounds (title, price, description, location, image, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [title, price, description, location, image, userId],
            (error, results) => {
                if (error) {
                    req.flash('error', 'Error creating campground.');
                    return res.redirect('/campgrounds/new');
                }

                req.flash('success', 'Campground created successfully.');
                res.redirect('/campgrounds');
            }
        );
    });
}

module.exports.insertReview = (req, res) => {
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
}

module.exports.deleteCamp = (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    const userId = req.user.id;
    const campgroundId = req.params.id;
    connection.query('SELECT user_id FROM campgrounds WHERE id = ?', campgroundId, (error, results) => {
        if (error) {
            req.flash('error', 'Error deleting campground.');
            return res.redirect('/campgrounds');
        }

        if (results.length === 0) {
            req.flash('error', 'Campground not found.');
            return res.redirect('/campgrounds');
        }
        const creatorId = results[0].user_id; 
        if (userId !== creatorId) {
            req.flash('error', 'You do not have permission to delete this campground.');
            return res.redirect('/campgrounds');
        }
        connection.query('DELETE FROM campgrounds WHERE id = ?', campgroundId, (error, deleteResults) => {
            if (error) {
                req.flash('error', 'Error deleting campground.');
                return res.redirect('/campgrounds');
            }

            if (deleteResults.affectedRows > 0) {
                req.flash('success', 'Campground successfully deleted.');
            } else {
                req.flash('error', 'Unable to find campground to delete.');
            }

            res.redirect('/campgrounds');
        });
    });
}

module.exports.show = (req, res) => {
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
}

module.exports.edit = (req, res) => {
    const campgroundId = req.params.id;
    const userId = req.user.id; 
    const checkOwnershipQuery = 'SELECT * FROM campgrounds WHERE id = ? AND user_id = ?';

    connection.query(checkOwnershipQuery, [campgroundId, userId], (error, results) => {
        if (error) {
            req.flash('error', 'Error checking campground ownership.');
            return res.redirect('/campgrounds');
        }
        if (results.length === 0) {
            req.flash('error', 'You do not have permission to edit this campground.');
            return res.redirect('/campgrounds/' + campgroundId);
        }
        const updatedCampground = req.body.campground;
        connection.query(
            'UPDATE campgrounds SET title = ?, price = ?, description = ?, location = ? WHERE id = ?',
            [updatedCampground.title, updatedCampground.price, updatedCampground.description, updatedCampground.location, campgroundId],
            (error, results) => {
                if (error) {
                    req.flash('error', 'Error updating campground.');
                    return res.redirect('/campgrounds/' + campgroundId);
                }
                req.flash('success', 'Campground updated successfully.');
                res.redirect('/campgrounds/' + campgroundId);
            }
        );
    });
}

module.exports.editCamp = (req, res) => {
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
}