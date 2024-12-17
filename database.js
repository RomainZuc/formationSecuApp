const sqlite3 = require('sqlite3').verbose();

// Créer une connexion à la base de données SQLite
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connexion à la base de données SQLite établie.');
});

// Créer la table des utilisateurs si elle n'existe pas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
    )`);

    // Ajouter un utilisateur par défaut (nom: 'admin', mot de passe: 'password123')
    db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ['admin', 'password123']);
});

module.exports = db; // Exporter la base de données pour l'utiliser ailleurs
