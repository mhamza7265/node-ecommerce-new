const mongoose = require("mongoose");

const sectionTwoSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
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
});

const SectionTwo = mongoose.model("SectionTwo", sectionTwoSchema);

module.exports = SectionTwo;
