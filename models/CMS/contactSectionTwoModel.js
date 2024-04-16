const mongoose = require("mongoose");

const contactTwoSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
});

const ContactTwo = mongoose.model("ContactTwo", contactTwoSchema);

module.exports = ContactTwo;
