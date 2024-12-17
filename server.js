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

// Page de login (formulaire)
app.get('/', (req, res) => {
    res.send(`
        <h1>Connexion</h1>
    <form id="loginForm">
        <label for="username">Nom d'utilisateur :</label><br>
        <input type="text" id="username" name="username" required><br><br>
        
        <label for="password">Mot de passe :</label><br>
        <input type="password" id="password" name="password" required><br><br>
        
        <button type="submit">Se connecter</button>
    </form>

    <p id="responseMessage"></p>

    <script>
        const form = document.getElementById("loginForm");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            try {
                // Envoie des données au backend via fetch
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    document.getElementById("responseMessage").innerText = data.message; // Connexion réussie
                    document.getElementById("responseMessage").style.color = "green";
                } else {
                    document.getElementById("responseMessage").innerText = data.message; // Erreur
                    document.getElementById("responseMessage").style.color = "red";
                }
            } catch (error) {
                console.error("Erreur :", error);
                document.getElementById("responseMessage").innerText = "Erreur de connexion au serveur.";
                document.getElementById("responseMessage").style.color = "red";
            }
        });
    </script>
    `);
});

// Route pour ajouter un utilisateur
app.post('/add-user', (req, res) => {
    const { username, password } = req.body;
console.log({ username, password })
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
    console.log(res)

    db.all(sql, [], (err, rows) => {
      console.log(rows)
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

// Route pour vérifier les informations de connexion
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Vérification des champs
    if (!username || !password) {
        return res.status(400).json({ message: "Le nom d'utilisateur et le mot de passe sont requis." });
    }

    // Requête SQL pour récupérer le mot de passe de l'utilisateur
    const sql = `SELECT password FROM users WHERE username = ?`;

    db.get(sql, [username], (err, row) => {
        if (err) {
            return res.status(500).json({ message: "Erreur interne du serveur.", error: err.message });
        }

        // Vérifie si l'utilisateur existe
        if (!row) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        // Vérifie si le mot de passe est correct
        if (row.password === password) {
            res.json({ message: "Connexion réussie !" });
        } else {
            res.status(401).json({ message: "Mot de passe incorrect." });
        }
    });
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
