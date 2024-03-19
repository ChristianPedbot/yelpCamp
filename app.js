require('dotenv').config();

const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql');
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override');

app.use(methodOverride('_method'));

app.get('/',(req, res) => {
    res.send('home');
})

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

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views', 'campgrounds'),
    path.join(__dirname, 'views', 'layouts')
]);

// Middleware para processar dados do formulário
app.use(express.urlencoded({ extended: true }));

app.get('/campgrounds/new', (req , res) => {
    res.render('new');
});

app.post('/campgrounds', (req, res) => {
    const { title, price, description, location, image } = req.body.campground; 
    connection.query('INSERT INTO campgrounds (title, price, description, location, image) VALUES (?, ?, ?, ?, ?)', [title, price, description, location, image], (error, results, fields) => {
        if (error) {
            console.error('Erro ao inserir o novo campground:', error);
            return res.status(500).send('Erro interno do servidor');
        }
        console.log('Novo campground inserido com sucesso');
        res.redirect('/campgrounds'); 
    });
});



app.get('/campgrounds', (req, res) => {
    connection.query('SELECT * FROM campgrounds', (error, results, fields) => {
        if (error) {
            console.error('Erro ao executar a consulta:', error);
            return res.status(500).send('Erro interno do servidor');
        }
        if (!results || results.length === 0) {
            console.error('Nenhum resultado retornado pela consulta.'); 
            return res.status(404).send('Nenhum resultado encontrado');
        }
        res.render('index', { campgrounds: results });
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

app.delete('/campgrounds/:id', (req, res) => {
    const campgroundId = req.params.id;
    connection.query('DELETE FROM campgrounds WHERE id = ?', campgroundId, (error, results, fields) => {
        if (error) {
            console.error('Erro ao executar a consulta:', error);
            return res.status(500).send('Erro interno do servidor');
        }
        if (!results || results.affectedRows === 0) {
            console.error('Nenhum resultado retornado pela consulta.');
            return res.status(404).send('Nenhum resultado encontrado');
        }
        res.redirect('/campgrounds'); 
    });
});

app.get('/campgrounds/:id/edit', (req, res) => {
    const campgroundId = req.params.id;
    // Aqui você deve executar uma consulta para obter os dados do acampamento com o ID especificado
    connection.query('SELECT * FROM campgrounds WHERE id = ?', campgroundId, (error, results, fields) => {
        if (error) {
            console.error('Erro ao executar a consulta:', error);
            return res.status(500).send('Erro interno do servidor');
        }
        if (!results || results.length === 0) {
            console.error('Nenhum resultado retornado pela consulta.');
            return res.status(404).send('Nenhum resultado encontrado');
        }
        // Renderizar o formulário de edição e passar os dados do acampamento para ele
        res.render('edit', { campground: results[0] }); // Supondo que você tenha um arquivo EJS chamado "edit.ejs"
    });
});

app.put('/campgrounds/:id', (req, res) => {
    const campgroundId = req.params.id;
    const updatedCampground = req.body.campground;

    // Aqui você deve executar uma consulta SQL para atualizar os dados do acampamento no banco de dados
    connection.query('UPDATE campgrounds SET title = ?, price = ?, description = ?, location = ? WHERE id = ?',
        [updatedCampground.title, updatedCampground.price, updatedCampground.description, updatedCampground.location, campgroundId],
        (error, results, fields) => {
            if (error) {
                console.error('Erro ao executar a consulta de atualização:', error);
                return res.status(500).send('Erro interno do servidor');
            }
            res.redirect('/campgrounds/' + campgroundId); // Redirecionar para a página do acampamento atualizado
        }
    );
});


app.get('/show', (req, res) => {
    res.render('show');
});

app.listen(3000, () => {
    console.log("Ouvindo na porta 3000");
});
