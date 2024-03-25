const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const methodOverride = require('method-override');
router.use(methodOverride('_method'));

const { handleQueryError, handleNoResults } = require('../app');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

router.get('/new', (req , res) => {
    res.render('new');
});

router.get('/register', (req, res) => {
    res.redirect('/users/register');
})

router.get('/', (req, res) => {
    connection.query('SELECT * FROM campgrounds', (error, results) => {
        if (error) return handleQueryError(res, error);
        if (!results || results.length === 0) return handleNoResults(res);
        res.render('index', { campgrounds: results });
    });
});

router.post('/', (req, res) => {
    const { title, price, description, location, image } = req.body.campground; 
    connection.query('INSERT INTO campgrounds (title, price, description, location, image) VALUES (?, ?, ?, ?, ?)', [title, price, description, location, image], (error, results) => {
        if (error) return handleQueryError(res, error);
        console.log('Novo campground inserido com sucesso');
        res.redirect('/campgrounds'); 
    });
});

router.post('/:id/review', (req, res) => { // Corrija a rota para /:id/review
    const campgroundId = req.params.id;
    const { body, rating } = req.body.review; 
    connection.query('INSERT INTO review (body, rating, campground_id) VALUES (?, ?, ?)', [body, rating, campgroundId], (error, results) => {
        if (error) return handleQueryError(res, error);
        console.log('Nova revisão inserida com sucesso');
        res.redirect('/campgrounds/' + campgroundId); 
    });
});

router.delete('/:id', (req, res) => {
    const campgroundId = req.params.id;
    connection.query('DELETE FROM review WHERE id = ?', campgroundId, (error, results) => {
        if (error) return handleQueryError(res, error);
        if (!results || results.affectedRows === 0) return handleNoResults(res);
        res.redirect('/campgrounds'); 
    });
});

router.get('/:id', (req, res) => {
    const campgroundId = req.params.id;
    const campgroundQuery = 'SELECT * FROM campgrounds WHERE id = ?';
    const reviewsQuery = 'SELECT * FROM review WHERE campground_id = ?';
    connection.query(campgroundQuery, campgroundId, (error, campgroundResults) => {
        if (error) return handleQueryError(res, error);
        if (campgroundResults.length === 0) return handleNoResults(res);
        const campground = campgroundResults[0];
        connection.query(reviewsQuery, campgroundId, (error, reviewsResults) => {
            if (error) return handleQueryError(res, error);
            res.render('show', { campground, reviews: reviewsResults });
        });
    });
});

router.put('/:id', (req, res) => {
    const campgroundId = req.params.id;
    const updatedCampground = req.body.campground;
    connection.query('UPDATE campgrounds SET title = ?, price = ?, description = ?, location = ? WHERE id = ?',
        [updatedCampground.title, updatedCampground.price, updatedCampground.description, updatedCampground.location, campgroundId],
        (error, results) => {
            if (error) return handleQueryError(res, error);
            res.redirect('/campgrounds/' + campgroundId);  
        }
    );
});

router.get('/:id/edit', (req, res) => {
    const campgroundId = req.params.id;
    connection.query('SELECT * FROM campgrounds WHERE id = ?', campgroundId, (error, results) => {
        if (error) return handleQueryError(res, error);
        if (!results || results.length === 0) return handleNoResults(res);
        res.render('edit', { campground: results[0] }); 
    });
});


router.delete('/:id', (req, res) => {
    const campgroundId = req.params.id;
    connection.query('DELETE FROM campgrounds WHERE id = ?', campgroundId, (error, results) => {
        if (error) return handleQueryError(res, error);
        if (!results || results.affectedRows === 0) return handleNoResults(res);
        res.redirect('/campgrounds'); 
    });
});

module.exports = router;
