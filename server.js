const express = require('express');
const mysql = require('mysql');

const app = express();
const PORT = process.env.PORT || 4000;

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'roy_lunetier'
});

// Connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connexion à la base de données réussie');
});

// Endpoint GET /api/users pour récupérer des utilisateurs depuis la base de données
app.get('/api/users', (req, res) => {
    connection.query('SELECT * FROM users', (error, results, fields) => {
        if (error) {
            console.error('Erreur lors de l\'exécution de la requête :', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs depuis la base de données' });
            return;
        }
        res.json(results); // Renvoie les résultats de la requête au format JSON
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Le serveur est en écoute sur le port ${PORT}`);
});
