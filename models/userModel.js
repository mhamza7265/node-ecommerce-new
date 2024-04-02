const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    sparse: true,
    unique: true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email address format",
    },
  },
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "Basic",
    required: true,
  },
  passwordCreated: {
    type: Boolean,
    required: true,
  },
  blocked: {
    type: Boolean,
    required: true,
  },
  verified: {
    type: Boolean,
    required: true,
  },
  verification: {
    type: Number,
    required: false,
  },
  deviceToken: {
    type: String,
    required: false,
  },
});

userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);

module.exports = User;
