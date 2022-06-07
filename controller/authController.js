const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendMail = require("../utils/email");

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
    role: req.body.role,
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

// protect route (Authentication)
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
// Authorization: verify user nào có quyền được tương tác với 1 resouce nào đó (kiểm tra 1 người dùng nào đó có quyền truy cập vào 1 tài nguyên nào đó hay không , kể cả khi đã login)

// VD: chỉ có admin mới có quyền tương tác(delete) user
exports.restrictTo = (...roles) => {
  // do middleware function chỉ nhận các tham số như err, req , res, next -> khi này cần 1 function bao  trả về middleware function
  return (req, res, next) => {
    //1: kiem tra role cua user la gi
    const { role } = req.user;
    // console.log(role);
    if (!roles.includes(role)) {
      return next(
        new AppError("You do not have permission to access this route ", 403) //http code 403 : forbidden -> không có quyền truy cập vào route này
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 lấy ra user dựa trên email truyền vào trong req.body
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with email address", 404));
  }
  // 2. Sinh ra  random reset token để gửi cho email
  const token = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // 3. gửi token qua email
  const resetPasswordURL = `${req.protocol}://${req.headers.host}/api/v1/users/resetPassword/${token}`;
  // console.log(resetPasswordURL);
  const message = `Forgot your password ? Enter this URL ${resetPasswordURL} to create new password `;
  const options = {
    from: "Admin <admin@jonas.io>",
    to: user.email,
    subject: "Reset your password(token valid in 10 min)",
    text: message,
    // html
  };
  try {
    await sendMail(options);
    res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    // reset lại token và timeExpire
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error while sending email. Please try again",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1: Lấy ra user dựa vào reset token
  const resetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  // tim kiem user dua tren token va thoi gian token exprire phai lon hon hien tai
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  // 2: nếu token chưa expired , và có user tương ứng với token , set password mới
  if (!user) {
    return next(new AppError("Token invalid or expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  // 3: update trường passwordChangeAt

  // 4: log user in and send JWT
  const token = generateToken({ id: user._id });
  res.status(200).json({
    status: "ok",
    token,
  });
});

// user update password when logged in
exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 Get user from collection
  const user = await User.findById(req.user.id).select("+password");

  // 2 check if POSTed current password is correct
  if (!(await user.comparePassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }
  // 3 if so , update password
  user.password = req.user.newPassword;
  user.passwordConfirm = req.user.passwordConfirm;
  await user.save();
  //4 log user in again , send JWT
  const token = generateToken({ id: user._id });
  res.status(200).json({
    status: "ok",
    token,
  });
});
