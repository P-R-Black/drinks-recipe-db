const express = require("express")
const app = express()
const mongoose = require('mongoose')
const DodModel = require('./models/DoD')
const cors = require("cors")
const schedule = require('node-schedule')
require("dotenv").config()


const { findRandom } = require('./scheduler')


app.use(express.json())
app.use(cors());

const dbPassword = process.env.APP_DB_PASSWORD
const urlDB = `mongodb+srv://ramoneblack:${dbPassword}@cluster0.7estopz.mongodb.net/drinks_app_db?retryWrites=true&w=majority`
mongoose.connect(urlDB)


const axios = require('axios')
const Redis = require('redis')

const drinksApi = process.env.DRINK_PUBLIC_KEY
const allCocktailsAPi = process.env.ALL_COCKTAILS_API_KEY
const mustKnowApi = process.env.DRINK_MUST_KNOWS_KEY
const allShotsApi = process.env.ALL_SHOTS_API_KEY
const drinksAPIKey = process.env.APP_API_KEY
const drinksAPIKeyProduction = process.env.PRODUCTION_KEY


// const tokenRequest = process.env.APP_JWT_REQUST

const redisClient = Redis.createClient({ legacyMode: true }) // in production const client = Redis.createClient({ url })
const DEFAULT_EXPIRATION = 3600



app.get("/getDrinkandDates", (req, res) => {
    DodModel.find().exec()
        .then(results => {
            res.json(results)
        })
        .catch(error => {
            res.json(error)
        });

})

const job = schedule.scheduleJob('00 03 * * *', function () {
    findRandom()
    console.log('called at 3:00AM')
    schedule.gracefulShutdown()
})


app.get("/getLastEntry", async (req, res) => {
    await DodModel.find().sort({ _id: -1 }).limit(1).exec()
        .then(results => {
            res.json(results[0].toObject())
        })
        .catch(error => {
            res.json(error)
        });
})

app.post("/saveDrinkandDates", async (req, res) => {
    const drink = req.body
    const newDrinkOfDay = new DodModel(drink);
    await newDrinkOfDay.save()

    res.json(drink)

})

app.post("/token/", async (req, res) => {
    const drinkId = req.query.drinkId

    redisClient.get("drinks", async (error, drinks) => {
        if (error) {
            console.error(error)
            await redisClient.connect()
        }
        if (drinks != null) {
            console.log('no token request')
            return res.json(JSON.parse(drinks))

        } else {
            console.log('token request')
            const { data: response } = await axios.get(tokenRequest, { params: { drinkId } })
            redisClient.SETEX('token', DEFAULT_EXPIRATION, JSON.stringify(response))
            res.json(response)
        }
    })


})


app.get("/drinks", async (req, res) => {
    const drinkId = req.query.drinkId

    redisClient.get("drinks", async (error, drinks) => {
        if (error) {
            console.error(error)
            await redisClient.connect()
        }
        if (drinks != null) {
            return res.json(JSON.parse(drinks))

        } else {
            const { data: response } = await axios.get(drinksApi,
                { headers: { 'Authorization': `Api-Key ${drinksAPIKeyProduction}` } }, { params: { drinkId } })
            redisClient.SETEX('drinks', DEFAULT_EXPIRATION, JSON.stringify(response))
            res.json(response)
            console.log('response', response)
        }
    })

})

app.get("/cocktails", async (req, res) => {
    const drinkId = req.query.drinkId


    redisClient.get("cocktails", async (error, cocktails) => {
        if (error) {
            console.error(error)
            await redisClient.connect()
        }
        if (cocktails != null) {
            return res.json(JSON.parse(cocktails))

        } else {
            const { data: response } = await axios.get(allCocktailsAPi, { headers: { 'Authorization': `Api-Key ${drinksAPIKeyProduction}` } }, { params: { drinkId } })
            redisClient.SETEX('cocktails', DEFAULT_EXPIRATION, JSON.stringify(response))
            res.json(response)
        }
    })

})

app.get("/must-knows", async (req, res) => {
    const drinkId = req.query.drinkId
    redisClient.get("must-knows", async (error, mustKnows) => {
        if (error) {
            console.error(error)
            await redisClient.connect()
        }
        if (mustKnows != null) {
            return res.json(JSON.parse(mustKnows))

        } else {
            const { data: response } = await axios.get(mustKnowApi, { headers: { 'Authorization': `Api-Key ${drinksAPIKeyProduction}` } }, { params: { drinkId } })
            redisClient.SETEX('must-knows', DEFAULT_EXPIRATION, JSON.stringify(response))
            res.json(response)
        }


    })

})


app.get("/shot", async (req, res) => {
    const drinkId = req.query.drinkId
    redisClient.get("shot", async (error, shots) => {
        if (error) {
            console.error(error)
            await redisClient.connect()
        }
        if (shots != null) {
            return res.json(JSON.parse(shots))

        } else {
            const { data: response } = await axios.get(allShotsApi, { headers: { 'Authorization': `Api-Key ${drinksAPIKeyProduction}` } }, { params: { drinkId } })
            redisClient.SETEX('shot', DEFAULT_EXPIRATION, JSON.stringify(response))
            res.json(response)
        }


    })

})




app.listen(3001, () => {
    console.log('Server Running...')
})



