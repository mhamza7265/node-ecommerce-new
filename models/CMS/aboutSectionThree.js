const mongoose = require("mongoose");

const sectionThreeSchema = new mongoose.Schema({
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
  text3: {
    type: String,
    required: true,
  },
  textAlign: {
    type: String,
    required: true,
  },
});

const SectionThree = mongoose.model("SectionThree", sectionThreeSchema);

module.exports = SectionThree;
