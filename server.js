const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 4000;

const fs = require('fs');
const readline = require('readline');

// Créer une connexion à la base de données
const connection = mysql.createConnection({
    host: 'localhost',
    port: 8889,
    user: 'root',
    password: 'root',
    database: 'roy_lunetier'
});

connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);
        return;
    }
    console.log('Connexion à la base de données réussie');
});

// Middleware pour parser le corps des requêtes POST
app.use(express.json());

// Récupérer tous les modèles
app.get('/models', (req, res) => {
    connection.query('SELECT * FROM models', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des modèles :', err);
            res.status(500).send('Erreur lors de la récupération des modèles');
            return;
        }

        res.json(results);
    });
});

// Récupérer un modèle spécifique par ID
app.get('/models/:id', (req, res) => {
    const id = req.params.id;

    connection.query('SELECT * FROM models WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération du modèle :', err);
            res.status(500).send('Erreur lors de la récupération du modèle');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Modèle non trouvé');
            return;
        }

        res.json(results[0]);
    });
});

// Créer un nouveau modèle
app.post('/models', (req, res) => {
    const newModel = req.body;

    connection.query('INSERT INTO models SET ?', newModel, (err, results) => {
        if (err) {
            console.error('Erreur lors de la création du modèle :', err);
            res.status(500).send('Erreur lors de la création du modèle');
            return;
        }

        res.status(201).send('Modèle créé avec succès');
    });
});

// Mettre à jour un modèle spécifique par ID
app.put('/models/:id', (req, res) => {
    const id = req.params.id;
    const updatedModel = req.body;

    connection.query('UPDATE models SET ? WHERE id = ?', [updatedModel, id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la mise à jour du modèle :', err);
            res.status(500).send('Erreur lors de la mise à jour du modèle');
            return;
        }

        res.send('Modèle mis à jour avec succès');
    });
});

// Supprimer un modèle spécifique par ID
app.delete('/models/:id', (req, res) => {
    const id = req.params.id;

    connection.query('DELETE FROM models WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la suppression du modèle :', err);
            res.status(500).send('Erreur lors de la suppression du modèle');
            return;
        }

        res.send('Modèle supprimé avec succès');
    });
});

// Récupérer tous les matériaux
app.get('/materials', (req, res) => {
    connection.query('SELECT * FROM materials', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des matériaux :', err);
            res.status(500).send('Erreur lors de la récupération des matériaux');
            return;
        }

        res.json(results);
    });
});

// Récupérer un matériau spécifique par ID
app.get('/materials/:id', (req, res) => {
    const id = req.params.id;

    connection.query('SELECT * FROM materials WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération du matériau :', err);
            res.status(500).send('Erreur lors de la récupération du matériau');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Matériau non trouvé');
            return;
        }

        res.json(results[0]);
    });
});

// Créer un nouveau matériau
app.post('/materials', (req, res) => {
    const newMaterial = req.body;

    // Vérifier si newMaterial est vide
    if (Object.keys(newMaterial).length === 0) {
        res.status(400).send('Les données nécessaires pour créer un nouveau matériau ne sont pas fournies');
        return;
    }

    connection.query('INSERT INTO materials SET ?', newMaterial, (err, results) => {
        if (err) {
            console.error('Erreur lors de la création du matériau :', err);
            res.status(500).send('Erreur lors de la création du matériau');
            return;
        }

        res.status(201).send('Matériau créé avec succès');
    });
});

// Mettre à jour un matériau spécifique par ID
app.put('/materials/:id', (req, res) => {
    const id = req.params.id;
    const updatedMaterial = req.body;

    connection.query('UPDATE materials SET ? WHERE id = ?', [updatedMaterial, id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la mise à jour du matériau :', err);
            res.status(500).send('Erreur lors de la mise à jour du matériau');
            return;
        }

        res.send('Matériau mis à jour avec succès');
    });
});

// Supprimer un matériau spécifique par ID
app.delete('/materials/:id', (req, res) => {
    const id = req.params.id;

    connection.query('DELETE FROM materials WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Erreur lors de la suppression du matériau :', err);
            res.status(500).send('Erreur lors de la suppression du matériau');
            return;
        }

        res.send('Matériau supprimé avec succès');
    });
});


// Lire le contenu de dbUpdates.sql
fs.readFile('dbUpdates.sql', 'utf8', (err, dbUpdates) => {
    if (err) {
        console.error('Erreur lors de la lecture de dbUpdates.sql :', err);
        return;
    }

    // Obtenir la structure actuelle de la base de données
    connection.query('SHOW CREATE TABLE materials', (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'obtention de la structure de la base de données :', err);
            return;
        }

        const currentDbStructure = results[0]['Create Table'];

        // Comparer dbUpdates avec la structure actuelle de la base de données
        if (dbUpdates !== currentDbStructure) {
            // Demander à l'utilisateur s'il souhaite mettre à jour la base de données
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            rl.question('La structure de la base de données a changé. Voulez-vous mettre à jour la base de données ? (y/n) ', (answer) => {
                if (answer.toLowerCase() === 'y') {
                    // Exécuter les commandes SQL de dbUpdates.sql pour mettre à jour la base de données
                    connection.query(dbUpdates, (err, results) => {
                        if (err) {
                            console.error('Erreur lors de la mise à jour de la base de données :', err);
                            return;
                        }
                        console.log('Base de données mise à jour avec succès');
                    });
                }

                rl.close();
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});