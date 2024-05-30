const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const port = 4000;
app.use(cors());

const uri = 'mongodb+srv://chaitanyakhairnar143:11zoCJr6xHOaaPDz@cluster0.0stazgx.mongodb.net/';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let database;
let serverStarted = false; // Flag to ensure startServer() is called only once

// Connect to MongoDB once and reuse the connection
async function connectToDatabase() {
    try {
        await client.connect();
        database = client.db('sample_mflix');
        console.log('Connected to MongoDB');
        if (!serverStarted) {
            startServer(); // Start the server after a successful connection
            serverStarted = true;
        }
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1); // Exit the process if the connection fails
    }
}

// Middleware to attach the database to the request object
app.use((req, res, next) => {
    if (!database) {
        res.status(500).send('Database connection not established');
        return;
    }
    req.db = database;
    next();
});

app.get('/', async (req, res) => {
    try {
        const collection = req.db.collection('movies');
        if (!collection) {
            res.status(500).send('Movies collection not found');
            return;
        }
        // Limiting the number of documents to 20
        const documents = await collection.find({}).limit(20).toArray();
        res.send(documents);
    } catch (err) {
        console.error('Error retrieving documents', err);
        res.status(500).send('Error retrieving documents');
    }
});


// Start the server
function startServer() {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

connectToDatabase().catch(console.error);
