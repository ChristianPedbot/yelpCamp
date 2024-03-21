require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');

app.use(methodOverride('_method'));

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

function handleQueryError(res, error) {
    console.error('Erro ao executar a consulta:', error);
    return res.status(500).send('Erro interno do servidor');
}

function handleNoResults(res) {
    console.error('Nenhum resultado retornado pela consulta.');
    return res.status(404).send('Nenhum resultado encontrado');
}

app.get('/', (req, res) => {
    res.send('home');
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views', 'campgrounds'),
    path.join(__dirname, 'views', 'layouts')
]);

app.use(express.urlencoded({ extended: true }));

app.get('/campgrounds/new', (req , res) => {
    res.render('new');
});

app.post('/campgrounds/:id/review', (req, res) => {
    const campgroundId = req.params.id;
    const { body, rating } = req.body.review; 
    connection.query('INSERT INTO review (body, rating, campground_id) VALUES (?, ?, ?)', [body, rating, campgroundId], (error, results) => {
        if (error) return handleQueryError(res, error);
        console.log('Nova revisão inserida com sucesso');
        res.redirect('/campgrounds/' + campgroundId); 
    });
});

app.post('/campgrounds', (req, res) => {
    const { title, price, description, location, image } = req.body.campground; 
    connection.query('INSERT INTO campgrounds (title, price, description, location, image) VALUES (?, ?, ?, ?, ?)', [title, price, description, location, image], (error, results) => {
        if (error) return handleQueryError(res, error);
        console.log('Novo campground inserido com sucesso');
        res.redirect('/campgrounds'); 
    });
});

app.get('/campgrounds', (req, res) => {
    connection.query('SELECT * FROM campgrounds', (error, results) => {
        if (error) return handleQueryError(res, error);
        if (!results || results.length === 0) return handleNoResults(res);
        res.render('index', { campgrounds: results });
    });
});

app.get('/campgrounds/:id', (req, res) => {
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

app.delete('/campgrounds/:id', (req, res) => {
    const campgroundId = req.params.id;
    connection.query('DELETE FROM campgrounds WHERE id = ?', campgroundId, (error, results) => {
        if (error) return handleQueryError(res, error);
        if (!results || results.affectedRows === 0) return handleNoResults(res);
        res.redirect('/campgrounds'); 
    });
});

app.delete('/campgrounds/:id/reviews/:id', (req, res) => {
    const campgroundId = req.params.id;
    connection.query('DELETE FROM review WHERE id = ?', campgroundId, (error, results) => {
        if (error) return handleQueryError(res, error);
        if (!results || results.affectedRows === 0) return handleNoResults(res);
        res.redirect('/campgrounds'); 
    });
});

app.get('/campgrounds/:id/edit', (req, res) => {
    const campgroundId = req.params.id;
    connection.query('SELECT * FROM campgrounds WHERE id = ?', campgroundId, (error, results) => {
        if (error) return handleQueryError(res, error);
        if (!results || results.length === 0) return handleNoResults(res);
        res.render('edit', { campground: results[0] }); 
    });
});

app.put('/campgrounds/:id', (req, res) => {
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

app.listen(3000, () => {
    console.log("Ouvindo na porta 3000");
});
