const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  image: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    required: false,
  },
});

const Setting = mongoose.model("Setting", settingsSchema);

module.exports = Setting;
