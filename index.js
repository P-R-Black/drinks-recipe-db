const express = require("express")
const app = express()
const mongoose = require('mongoose')
const DodModel = require('./models/DoD')
const cors = require("cors")
const schedule = require('node-schedule')


// const fishYatesShuffle = require('fishYatesShuffle');
// const  findRandom = require('findRandom');

const { findRandom, updateDb } = require('./scheduler')


app.use(express.json())
app.use(cors());

const urlDB = 'mongodb+srv://ramoneblack:1oqUFuDmaiWjJae6@cluster0.7estopz.mongodb.net/drinks_app_db?retryWrites=true&w=majority'
mongoose.connect(urlDB)


app.get("/getDrinkandDates", (req, res) => {
    DodModel.find().exec()
        .then(results => {
            res.json(results)
        })
        .catch(error => {
            res.json(error)
        });

})

const job = schedule.scheduleJob('14 19 * * *', function(){
    findRandom()
    console.log('called at 7:14PM')
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

app.listen(3001, () => {
    console.log('Server Running...')
})



