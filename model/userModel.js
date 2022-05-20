const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, " Please provide a name "],
  },
  email: {
    type: String,
    required: [true, " Please provide an email "],
    unique: true,
    lowercase: true,
    validate: {
      validator: function (val) {
        return validator.isEmail(val);
      },
      message: " Please provide a valid email ",
    },
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    minLength: 8,
    required: [true, "Please provide an password"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm a password"],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      messagge: "Password must match",
    },
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
