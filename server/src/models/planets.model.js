const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

const planets = require('./planets.mongo');

// const habitablePlanets = [];

function isHabitablePlanet(planet) {
    return planet['koi_disposition'] === 'CONFIRMED'
        && planet['koi_insol'] > 0.36
        && planet['koi_insol'] < 1.11
        && planet['koi_prad'] < 1.6;
}

function loadPlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler_data.csv'))
            .pipe(parse({
                comment: '#',
                columns: true,
            }))
            .on('data', async (data) => {
                if (isHabitablePlanet(data)) {
                    savePlanet(data);
                   
                }
            })
            .on('error', (err) => {
                console.log(err);
                reject(err);
            })
            .on('end', async () => {
                const countPlanetsFound =(await getAllPlanets()).length;

                console.log(`${countPlanetsFound} habitable planets found!`);
                console.log('done');
                resolve()
            })
    })
}


async function getAllPlanets() {
    return await planets.find(
        {},
        {
            '_id': 0, // 2nd parameter
            '__v': 0, // excludes these document properties
        }
    )
}

// CREATE/UPDATE/UPSERT Planet
async function savePlanet(planet) {
    try {
        await planets.updateOne(
            {
                keplerName: planet.kepler_name, // 1st-param, If data does not exist
            }, 
            {
                keplerName: planet.kepler_name, // 2nd-params, Updates data if required
            },
            {
                upsert: true, // 3rd-params, Upsert-feature
            }
        )
    } catch(err) {
        console.error(`Could not save planet ${err}`);
    }
}


module.exports = {
    loadPlanetsData,
    getAllPlanets
}