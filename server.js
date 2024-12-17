const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database'); // Importer la base de données

const app = express();
const PORT = 3000;

// Middleware pour traiter les requêtes POST (formulaires)
app.use(bodyParser.urlencoded({ extended: true }));

// Page de login (formulaire)
app.get('/', (req, res) => {
    res.send(`
        <h1>Login</h1>
        <form method="POST" action="/login">
            <label>Nom d'utilisateur :</label>
            <input type="text" name="username" required />
            <br />
            <label>Mot de passe :</label>
            <input type="password" name="password" required />
            <br />
            <button type="submit">Se connecter</button>
        </form>
    `);
});

// Route pour gérer les connexions
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Vérifier l'utilisateur dans la base de données
    const query = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(query, [username, password], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Erreur du serveur.");
        } else if (row) {
            res.send(`<h2>Bienvenue, ${username} !</h2>`);
        } else {
            res.send(`<h2>Nom d'utilisateur ou mot de passe incorrect.</h2>`);
        }
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
