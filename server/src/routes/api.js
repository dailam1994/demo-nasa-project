const express = require('express');

const planetsRouter = require('./planets/planets.router');
const launchesRouter = require('./launches/launches.router');

const api = express.Router();

// // ROUTES - no versioning
// app.use('/planets', planetsRouter);
// app.use('/launches', launchesRouter);

// // ROUTES - versioning - method 1
// api.use('/v1/planets', planetsRouter);
// api.use('/v1/launches', launchesRouter);

// ROUTES - versioning - method 2
api.use('/planets', planetsRouter);
api.use('/launches', launchesRouter);

module.exports = api;