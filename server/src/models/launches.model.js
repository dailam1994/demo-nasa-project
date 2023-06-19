const axios = require('axios');
const launchesDB = require('./launches.mongo')
const planets = require('./planets.mongo')

// const launches = new Map(); // Prior to DB
const DEFAULT_FLIGHT_NUMBER = 100;

// Prior to DB
// const launch = {
//     flightNumber: 100, // flight_number
//     mission: 'Kepler Exploration X', // name
//     rocket: 'Explorer IS1', // rocket.name
//     launchDate: new Date('December 27, 2030'), // date_local
//     target: 'Kepler-442 b', // n/A
//     customers: ['ZTM', 'NASA'], // payload.customers foreach payload
//     upcoming: true, // upcoming
//     success: true, // success
// }

// saveLaunch(launch)

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

// GET
// Launches API Data
async function populateLaunches() {
    console.log('Downloading launch data...')
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        customers: 1
                    }
                }
            ]
        }        
    });

    // API Data Validation
    if (response.status !== 200) {
        console.log('Error: Can not download launch data');
        throw new Error('Launch data download failed');
    }

    const launchDocs = response.data.docs;
    for (let launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers']
        })

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            succes: launchDoc['success'],
            customers, 
        }

        // console.log('launch', launch.mission);
        
        await saveLaunch(launch)
    }
}

async function loadLaunchData() {
    // Checking to see if the SpaceX API data already exist in the DB, using the 1st object
    const firstLaunch = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    })

    if (firstLaunch) {
        console.log('Launch data already loaded');
    } else {
        // Downloading launchese data if non-existing in the DB
        await populateLaunches()
    }
}

// ALL Launches
async function getAllLaunches(skip, limit) {
    return await launchesDB.find(
        {},
        {
            '_id': 0,
            '__v': 0
        }
    ).sort({
        flightNumber: 1, // 1 - Aesc, -1 - Desc
    }).skip(skip).limit(limit);
}

async function findLaunch(filter) {
    return await launchesDB.findOne(filter)
}

// Launch w/ ID
async function existsLaunchWithId(launchId) {
    // Prior to nesting methods
    // return await launchesDB.findOne({
    //     flightNumber: launchId
    // })

    return await findLaunch({
        flightNumber: launchId
    })
}

// Latest Flight Number
async function getLatestFlightNumber() {
    const latestLaunch = await launchesDB.findOne().sort('-flightNumber'); // '-' locates the flightNumber in DESC order

    if (!latestLaunch) {
        return DEFAULT_FLIGHT_NUMBER;
    }

    return latestLaunch.flightNumber
}

async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;
    const planet = await planets.findOne({    
        keplerName: launch.target,   
    })

    if (!planet) {
        throw new Error('No matching plant found!')
    }

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customer: ['Zero To Mastery', 'NASA'],
        flightNumber: newFlightNumber
    })

    await saveLaunch(newLaunch) 
}

// UPSERT
async function saveLaunch(launch) {
    await launchesDB.findOneAndUpdate(
        {
            flightNumber: launch.flightNumber,
        },
        launch,
        {
            upsert: true
        }
    )
}

// DELETE
async function abortLaunchById(launchId) {
    // My custom
    const aborted = await launchesDB.deleteOne({
        flightNumber: launchId
    })

    return aborted.deletedCount === 1 && aborted.acknowledged === true;
}

module.exports = {
    loadLaunchData,
    getAllLaunches,
    existsLaunchWithId,
    scheduleNewLaunch, 
    abortLaunchById
}