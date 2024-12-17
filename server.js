const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error("Erreur lors de la connexion à la base de données :", err.message);
    } else {
        console.log("Base de données connectée !");
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                password TEXT NOT NULL
            )
        `);
    }
});

// Route pour ajouter un utilisateur
app.post('/add-user', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Le nom d'utilisateur et le mot de passe sont requis." });
    }

    const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(sql, [username, password], (err) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de l'ajout de l'utilisateur.", error: err.message });
        }
        res.status(201).json({ message: "Utilisateur ajouté avec succès !" });
    });
});

// Route pour modifier un utilisateur
app.put('/update-user/:username', (req, res) => {
    const { username } = req.params;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Le mot de passe est requis pour la mise à jour." });
    }

    const sql = `UPDATE users SET password = ? WHERE username = ?`;
    db.run(sql, [password, username], function (err) {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la mise à jour de l'utilisateur.", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.json({ message: "Utilisateur mis à jour avec succès !" });
    });
});

// Route pour supprimer un utilisateur
app.delete('/delete-user/:username', (req, res) => {
    const { username } = req.params;

    const sql = `DELETE FROM users WHERE username = ?`;
    db.run(sql, [username], function (err) {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur.", error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        res.json({ message: "Utilisateur supprimé avec succès !" });
    });
});

// Route pour récupérer tous les utilisateurs
app.get('/users', (req, res) => {
    const sql = `SELECT username FROM users`;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs.", error: err.message });
        }

        if (rows.length === 0) {
            return res.status(404).json({ message: "Aucun utilisateur trouvé dans la base de données." });
        }

        res.json({
            message: "Liste des utilisateurs récupérée avec succès !",
            users: rows
        });
    });
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
