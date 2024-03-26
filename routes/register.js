// routes/register.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

router.get('/', (req, res) => {
    res.render('register'); // Renderiza o formulário de registro (register.ejs)
});

// Rota para processar o envio do formulário de registro
router.post('/', async (req, res) => {
    const { username,email, password } = req.body;

    try {
        // Gerar hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir usuário no banco de dados
        await connection.query('INSERT INTO users (username ,email, password) VALUES (?, ?, ?)', [username ,email, hashedPassword]);
        console.log("deu certo");
        req.flash('success', 'Usuário registrado com sucesso!');
        res.redirect('/login'); // Redireciona para a página de login após o registro bem-sucedido
    } catch (error) {
        console.error('Erro durante o registro:', error);
        req.flash('error', 'Erro durante o registro. Por favor, tente novamente.');
        res.redirect('/register'); // Redireciona de volta para o formulário de registro em caso de erro
    }
});

module.exports = router;
