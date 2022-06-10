const User = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const filterObj = (obj, ...schemaFields) => {
  const data = {};
  /**
   * req.body = {
   *  name: ...,
   *  email: ... ,
   *  role: admin -> role nay se khong duoc cap nhat
   * }
   * */
  Object.keys(obj).forEach((el) => {
    if (schemaFields.includes(el)) {
      data[el] = obj[el];
    }
  });
  return data;
};
// thêm các phương thức vào trong object exports
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      result: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      messgae: err,
    });
  }
};
exports.createNewUser = catchAsync(async (req, res) => {
  const newUser = await User.create(req.body);
  res.status(200).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// user udpate account
exports.updateMe = catchAsync(async (req, res, next) => {
  //1 . Kiểm tra nếu có password trong req.body -> trả về lỗi đường dẫn này không update password
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route dont update password. Please try /updatePassword instead ",
        400
      )
    );
  }
  // 2. Filter các trường sẽ update trong route này và bỏ các trường k đc phép update (như role)
  const dataUpdate = filterObj(req.body, "name", "email");
  // 3. update user
  const updatedUser = await User.findByIdAndUpdate(req.user._id, dataUpdate, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// user delete account
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user._id);
  res.status(204).json({
    status: "success",
    data: null,
  });
});
exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route has not defined yet",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route has not defined yet",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route has not defined yet",
  });
};
