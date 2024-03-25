const express = require('express');
const router = express.Router({ mergeParams: true }); // Certifique-se de que mergeParams esteja definido como true
const mysql = require('mysql');
const methodOverride = require('method-override');

// Adicione o middleware express.urlencoded() aqui
router.use(express.urlencoded({ extended: true }));

const { handleQueryError, handleNoResults } = require('../app');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
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

module.exports = router;
