const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
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
    select: false, // khi query từ database thì sẽ không hiện trường password
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
  passwordChangeAt: Date,
});
// encrypt password: xảy ra trước khi lưu password vào trong Database
userSchema.pre("save", async function (next) {
  // nếu như có trường nào khác modified dữ liệu thì không cần phải hash lại password đã lưu trong db
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  // không lưu password confirm vào trong DB . chỉ để validate password nhập vào
  this.passwordConfirm = undefined;
  next();
});

// instance method
userSchema.method(
  "comparePassword",
  async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
  }
);
// kiểm tra nếu thời gian thay đổi password xảy ra sau khi token được issue
userSchema.methods.changePasswordAfter = function (JWTTimeIssued) {
  // nếu JWTTimeIssue nhỏ hơn timeChangePassword -> trả về true
  if (this.passwordChangeAt) {
    const timeChangePassword = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    // console.log(timeChangePassword, JWTTimeIssued);
    return timeChangePassword > JWTTimeIssued;
  }
  return false;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
