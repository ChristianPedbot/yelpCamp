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

// Função para verificar se a senha fornecida corresponde à senha armazenada
User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// Configuração da estratégia local de autenticação
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({ where: { email: email } }) // Busca o usuário com base no e-mail
    .then(user => {
        if (!user) {
            return done(null, false, { message: 'Usuário não encontrado.' });
        }
        // Verifica se a senha fornecida pelo usuário corresponde à senha hash armazenada no banco de dados
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return done(err);
            }
            if (result) {
                // Se as senhas correspondem, autenticação bem-sucedida, retornando o usuário
                return done(null, user);
            } else {
                // Senha incorreta
                return done(null, false, { message: 'Senha incorreta.' });
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
