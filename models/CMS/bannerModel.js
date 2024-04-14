const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
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

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
