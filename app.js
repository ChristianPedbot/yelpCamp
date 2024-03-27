require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const registerRouter = require('./routes/register');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const users = require('./routes/users');

require('./auth')(passport);

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

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);
app.use('/users', users);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/users/register', registerRouter);


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
