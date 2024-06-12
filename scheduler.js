const axios = require('axios')
const fetch = require('node-fetch');
require("dotenv").config()
const Redis = require('redis');
const { base } = require('./models/DoD');

const drinksApi = process.env.DRINK_PUBLIC_KEY
const dbEndpoint = process.env.APP_DB_GET_KEY
const drinksAPIKey = process.env.APP_API_KEY

const redisClient = Redis.createClient() // in production const client = Redis.createClient({ url })
const DEFAULT_EXPIRATION = 3600


var date = new Date()
var year = date.getFullYear();
var month = date.getMonth();
var day = date.getDate();
var dd = String(day).padStart(2, '0');
var mm = String(month + 1).padStart(2, '0'); //January is 0!
let today = `${year}-${mm}-${dd}`


const fetchDrinkApiData = async () => {
    let allDrinksInApi;
    try {
        const { data: response } = await axios.get(drinksApi, {
            headers: {
                'Authorization': `Api-Key ${drinksAPIKey}`
            }
        });
        allDrinksInApi = response
    } catch (error) {
        console.error(error.message);
    }
    return allDrinksInApi
}

    ;


const fetchDbData = async () => {
    let fetchData;
    try {
        const { data: response } = await axios.get(dbEndpoint);
        fetchData = response
    } catch (error) {
        console.error(error.message);
    }
    return fetchData.map((fd) => fd.name)
}


// Sort Drink Array For Dod Selection
const fishYatesShuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr
}


// Selects Drink of the day and assigns it UpdateDb function.
const findRandom = () => {
    let testing = fetchDrinkApiData()
    let pastDrinkNames = fetchDbData()
    let dod;
    testing.then(function (result) {
        const todaysDrink = result.map((td) => td.drink_name)
        const shuffleDrinks = fishYatesShuffle([...todaysDrink]);
        pastDrinkNames.then(function (res) {
            for (const element of shuffleDrinks) {
                if (!res.includes(element)) {
                    dod = element
                    updateDb(dod)
                    break
                }
            }
        })
    })
}


const updateDb = async (dod) => {
    try {
        const newDrink = dod;

        // Make an HTTP POST request to the /saveDrinkandDates endpoint
        const requestBody = {
            name: newDrink,
            theDate: `${year}-${mm}-${dd}`,
        };

        const response = await fetch('http://localhost:3001/saveDrinkandDates', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('Drink saved successfully:', responseData);
        } else {
            console.error('Failed to save drink:', response.status);
        }

    } catch (error) {
        console.error('Error in updateDb:', error);
    }

}


module.exports = { findRandom, updateDb }