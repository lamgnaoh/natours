const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    // tạo token -> jwt.sign(payload , secretOrPrivatekey , [option , callback])
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRETKEY, {
      expiresIn: process.env.JWT_EXPIRED, // expired_in: sau một khoảng thời gian , chuỗi token không còn valid nữa
    });
    res.status(200).json({
      status: "success",
      token: token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
