const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ecommerce", {
      family: 4,
    });
    console.log("Connected to DB");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectToDB;
