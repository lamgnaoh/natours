const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

function generateToken(payload) {
  // tạo token -> jwt.sign(payload , secretOrPrivatekey , [option , callback])
  return jwt.sign(payload, process.env.JWT_SECRETKEY, {
    expiresIn: process.env.JWT_EXPIRED, // expired_in: sau một khoảng thời gian , chuỗi token không còn valid nữa
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
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
});

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

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

// protect route
exports.protect = catchAsync(async (req, res, next) => {
  // 1 kiểm tra nếu trong header có chứa token hay không
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in !!! Please login to access", 401) // 401: unauthorization
    );
  }

  // 2 Validate token

  // promisify() trả về 1 version  Promise của 1 function
  /**
   * VD: const verify =  promisify(jwt.verify)  <=>  verify now is the promise version of jwt.verify
   */
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRETKEY);
  // console.log(payload);
  // 3 Kiểm tra nếu user còn tồn tại
  const currentUser = await User.findById(payload.id);
  if (!currentUser) {
    return next(
      new AppError(
        "User belong to this token does no longer exists . Please sign up new user",
        401
      )
    );
  }
  // 4 Kiểm tra nếu user thay đổi password sau khi token được sinh ra -> cần login lại
  if (currentUser.changePasswordAfter(payload.iat)) {
    return next(
      new AppError("User recently change password ! Please login again", 401)
    );
  }

  // truyền dữ liệu current user cho biến req để các hàm middleware tiếp theo có thể sử dụng
  req.user = currentUser;
  next();
});
