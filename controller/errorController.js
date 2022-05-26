const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const field = err.errmsg.match(/"(.*?)"/)[0];
  const message = `Duplicate field value ${field}. Please use another value`;
  return new AppError(message, 404);
};
const handleJsonWebTokenError = (err) => {
  const message = `Invalid token . Please try login again `;
  return new AppError(message, 401);
};
const handleTokenExpiredError = (err) => {
  const message = `Token has expired. Please login again`;
  return new AppError(message, 401);
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.name = err.name;
    error.errmsg = err.errmsg;
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    // neu loi do token invalid
    if (error.name === "JsonWebTokenError")
      error = handleJsonWebTokenError(error);
    // lỗi do token time expire
    if (error.name === "TokenExpiredError")
      error = handleTokenExpiredError(error);
    // operational error
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
      });
      // programming error
    } else {
      // 1. Log error
      console.error(error);
      // 2. Send generic message
      res.status(500).json({
        status: "error",
        message: "Some thing went wrong",
      });
    }
  }
  next();
};
