const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema({
  text1: {
    type: String,
    required: true,
  },
  text2: {
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

const Slider = mongoose.model("Slider", sliderSchema);

module.exports = Slider;
