const express = require('express'); // Importing Express framework
const bodyParser = require('body-parser'); // Middleware for parsing incoming request bodies
const jwt = require('jsonwebtoken'); // Library for JSON Web Token (JWT) authentication
const { MongoClient } = require('mongodb'); // MongoDB client
const { ImapSimple } = require('imap-simple'); // Library for interacting with IMAP servers

const app = express(); // Creating an Express application
const port = 3000; // Port number for the server

// MongoDB setup
const uri = 'mongodb://localhost:27017'; // MongoDB connection URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // Creating a MongoClient
let db; // Database instance

// Function to connect to the MongoDB database
async function connectToDatabase() {
    try {
        await client.connect(); // Connecting to the MongoDB server
        db = client.db('emailDB'); // Selecting the database
        console.log('Connected to the database');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
}

connectToDatabase(); // Calling the function to connect to the database

// Express middleware
app.use(bodyParser.json()); // Using bodyParser middleware to parse JSON request bodies

// Route for user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body; // Extracting email and password from request body

    // Dummy authentication logic (for demonstration purposes)
    if (email === 'user@example.com' && password === 'password') {
        const token = jwt.sign({ email }, 'secret_key', { expiresIn: '1h' }); // Generating JWT token
        res.json({ token }); // Sending token as JSON response
    } else {
        res.status(401).send('Invalid credentials'); // Sending 401 Unauthorized status if credentials are invalid
    }
});

// Route to fetch emails (requires authentication)
app.get('/emails', authenticateToken, async (req, res) => {
    try {
        // Dummy email synchronization logic
        const emails = await getEmailsFromDatabase(); // Fetching emails from database
        res.json(emails); // Sending fetched emails as JSON response
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).send('Internal Server Error'); // Sending 500 Internal Server Error status if an error occurs
    }
});

// Function to fetch emails from the database
async function getEmailsFromDatabase() {
    const collection = db.collection('emails'); // Getting collection reference
    try {
        const emails = await collection.find().toArray(); // Fetching emails from collection
        return emails; // Returning fetched emails
    } catch (error) {
        console.error('Error fetching emails from database:', error);
        throw error; // Throwing error if unable to fetch emails
    }
}

// Middleware function to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Getting Authorization header from request
    const token = authHeader && authHeader.split(' ')[1]; // Extracting token from Authorization header
    if (token == null) return res.sendStatus(401); // Sending 401 Unauthorized status if token is missing

    // Verifying JWT token
    jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.sendStatus(403); // Sending 403 Forbidden status if token verification fails
        req.user = user; // Storing user information in request object
        next(); // Calling next middleware function
    });
}

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});s