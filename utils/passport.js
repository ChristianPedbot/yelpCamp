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

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({ where: { email: email } })
    .then(user => {
        if (!user) {
            return done(null, false);
        }
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return done(err);
            }
            if (result) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    })
    .catch(err => {
        return done(err);
    });
}));

module.exports = function(app) {
    app.use(passport.initialize());
};
