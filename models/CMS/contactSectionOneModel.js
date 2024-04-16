const mongoose = require("mongoose");

const contactOneSchema = new mongoose.Schema({
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

const ContactOne = mongoose.model("ContactOne", contactOneSchema);

module.exports = ContactOne;
