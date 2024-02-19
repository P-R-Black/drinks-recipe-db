const express = require("express")
const app = express()
const mongoose = require('mongoose')
const DodModel = require('./models/DoD')
const cors = require("cors")

app.use(express.json())
app.use(cors())

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

app.post("/saveDrinkandDates", async (req, res) => {
    const drink = req.body
    const newDrinkOfDay = new DodModel(drink);
    await newDrinkOfDay.save()

    res.json(drink)

})

app.listen(3001, () => {
    console.log('Server Running...')
})

