require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log('Conexão bem-sucedida ao banco de dados MySQL');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views', 'campgrounds'));


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', (req, res) => {
    connection.query('SELECT title, price FROM campgrounds', (error, results, fields) => {
        if (error) {
            console.error('Erro ao executar a consulta:', error);
            return res.status(500).send('Erro interno do servidor');
        }
        if (!results || results.length === 0) {
            console.error('Nenhum resultado retornado pela consulta.');
            return res.status(404).send('Nenhum resultado encontrado');
        }
        res.render('campgrounds', { campgrounds: results });
    });
});

app.get('/campgrounds/:id', (req, res) => {
    const campgroundId = req.params.id;
    connection.query('SELECT * FROM campgrounds WHERE id = ?', campgroundId, (error, results, fields) => {
        if (error) {
            console.error('Erro ao executar a consulta:', error);
            return res.status(500).send('Erro interno do servidor');
        }
        if (!results || results.length === 0) {
            console.error('Nenhum resultado retornado pela consulta.');
            return res.status(404).send('Nenhum resultado encontrado');
        }
        res.render('show', { campground: results[0] });
    });
});

app.get('/show', (req, res) => {
    res.render('show');
});

app.get('/campgrounds', (req, res) => {
    connection.query('SELECT title, price FROM campgrounds', (error, results, fields) => {
        if (error) {
            console.error('Erro ao executar a consulta:', error);
            return res.status(500).send('Erro interno do servidor');
        }
        if (!results || results.length === 0) {
            console.error('Nenhum resultado retornado pela consulta.');
            return res.status(404).send('Nenhum resultado encontrado');
        }
        res.render('campgrounds', { campgrounds: results });
    });
});


app.listen(3000, () => {
    console.log("Ouvindo na porta 3000");
});
