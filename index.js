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
const redisClient = Redis.createClient({legacyMode: true}) // in production const client = Redis.createClient({ url })
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

const job = schedule.scheduleJob('00 03 * * *', function(){
    findRandom()
    console.log('called at 3:00AM')
    schedule.gracefulShutdown()
})


app.get("/getLastEntry", async (req, res)=> {
    await DodModel.find().sort({ _id: -1}).limit(1).exec()
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



app.get("/drinks", async (req, res) => {
    const drinkId = req.query.drinkId
   
    redisClient.get("drinks", async (error, drinks) => {
        if (error) {
            console.log('cache hit')
            console.error(error)
            await redisClient.connect()
        }
        if (drinks != null){
            console.log('cache hit')
            return res.json(JSON.parse(drinks))
           
        } else {
            console.log('cache not hit')
            const { data: response } = await axios.get(drinksApi, {params: { drinkId }})
            redisClient.SETEX('drinks', DEFAULT_EXPIRATION, JSON.stringify(response)) 
            res.json(response)
        }
        

    })

})

  
app.listen(3001, () => {
    console.log('Server Running...')
})



