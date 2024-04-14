const mongoose = require("mongoose");

const bestsellingSchema = new mongoose.Schema({
  text1: {
    type: String,
    required: true,
  },
  textAlign: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const Bestselling = mongoose.model("Bestselling", bestsellingSchema);

module.exports = Bestselling;
