const mongoose = require("mongoose");

const drinkOfTheDaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    theDate: {
        type: Date,
        required: true,
    }, 
});

const DodModel = mongoose.model("Model", drinkOfTheDaySchema, "drinks_of_the_day")
module.exports = DodModel