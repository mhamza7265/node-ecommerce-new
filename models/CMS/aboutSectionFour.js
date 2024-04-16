const mongoose = require("mongoose");

const sectionFourSchema = new mongoose.Schema({
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

const SectionFour = mongoose.model("SectionFour", sectionFourSchema);

module.exports = SectionFour;
