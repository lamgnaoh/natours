const User = require("../model/userModel");
const jwt = require("jsonwebtoken");

function generateToken(payload) {
  // tạo token -> jwt.sign(payload , secretOrPrivatekey , [option , callback])
  return jwt.sign(payload, process.env.JWT_SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRED, // expired_in: sau một khoảng thời gian , chuỗi token không còn valid nữa
  });
}

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    // tạo token -> jwt.sign(payload , secretOrPrivatekey , [option , callback])
    const token = generateToken({ id: newUser._id });
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

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    //Concept của login
    // 1: kiểm tra nếu email và password có tồn tại trong req.body hay không
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      });
    }
    // 2 : kiểm tra nếu user tồn tại trong db và password đúng
    const user = await User.findOne({ email }).select("+password");

    const result = await user.comparePassword(password, user.password);
    // console.log(result);
    if (
      user.email !== email ||
      !(await user.comparePassword(password, user.password))
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }
    // 3: nếu mọi thứ ok , sinh token và  gửi token cho client
    const token = generateToken({ id: user._id });
    res.status(200).json({
      status: "ok",
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
