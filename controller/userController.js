const User = require("../model/userModel");

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
exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route has not defined yet",
  });
};
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
