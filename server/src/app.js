const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const api = require('./routes/api');

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(morgan('combined'))
app.use(express.json())
app.use(express.static(path.join(__dirname, '..', 'public')));
// app.use(api); // Method 1
app.use('/v1', api); // Method 2
// app.use('/v2', v2Router) // Example of version 2, Supports multi-version of our APIs at the same time

// GET
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

module.exports = app;