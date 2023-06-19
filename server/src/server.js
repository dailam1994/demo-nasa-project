const http = require('http');
// const cluster = require('cluster');
// const os = require('os');
require('dotenv').config();

const PORT = process.env.PORT || 8000;
const app = require('./app');
const server = http.createServer(app);

const { mongoConnect } = require('./services/mongo')
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchData } = require('./models/launches.model')

// cluster.schedulingPolicy = cluster.SCHED_RR;

async function startServer() {
    await mongoConnect()
    await loadPlanetsData();
    await loadLaunchData();

    console.log('Running server.js...');

    // if (cluster.isMaster) {
    //     console.log('Master has been started...');

    //     // Uncomment for max-performance --------------------------------------------------------------------------------
    //     // Obtaining number of physical and logical cores
    //     // const NUM_WORKERS = os.cpus().length

    //     // // Looping through number of cores to determine how many process-workers may be created to maximise
    //     // for (let i = 0; i < NUM_WORKERS; i++) {
    //     //     cluster.fork()
    //     // }    
    //     // -------------------------------------------------------------------------------------------------------------

    //     // Uncomment for single processor 
    //     cluster.fork()
    // } else {
    //     console.log('Worker process started.');

    //     // Only call app.listen() when working as a worker-process
    //     server.listen(PORT, () => {
    //         console.log(`Listening on port ${PORT}...`);
    //     })   
    // }
    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}...`);
    })   
}

startServer();
