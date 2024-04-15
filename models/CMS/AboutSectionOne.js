const mongoose = require("mongoose");

const sectionOneSchema = new mongoose.Schema({
  image: {
    type: String,
    required: false,
  },
  carouselImages: {
    type: Array,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
});

const SectionOne = mongoose.model("SectionOne", sectionOneSchema);

module.exports = SectionOne;
