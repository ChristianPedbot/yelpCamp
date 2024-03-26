const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('mysql://root:root@mysql:3306/yelpcamp');

const User = sequelize.define('users', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findByPk(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
},
(email, password, done) => {
    User.findOne({ where: { email: email }, attributes: ['id', 'email', 'password'] })
        .then(user => {
            if (!user) {
                return done(null, false, { message: 'Usuário não encontrado.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Senha incorreta.' });
            }
            return done(null, user);
        })
        .catch(err => {
            return done(err);
        });
}));

module.exports = function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    // Outras configurações do Passport.js aqui
};