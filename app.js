require('dotenv').config();

const express = require('express');
const sequelize = require('sequelize')
const app = express();
const path = require('path');
const mysql = require('mysql');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('./auth')(passport);
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const users = require('./routes/users');

const sessionConfig = {
    secret: '123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now(),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(flash());
app.use('/campgrounds' , campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use('/users', users);
app.use('/login', loginRouter);
app.use('/register', registerRouter);



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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views', 'campgrounds'),
    path.join(__dirname, 'views', 'layouts'),
    path.join(__dirname, 'views', 'users')
]);

app.listen(3000, () => {
    console.log("Ouvindo na porta 3000");
});
