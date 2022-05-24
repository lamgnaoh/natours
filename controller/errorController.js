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
    // operational error
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
      // programming error
    } else {
      // 1. Log error
      console.error(err);
      // 2. Send generic message
      res.status(500).json({
        status: "error",
        message: "Some thing went wrong",
      });
    }
  }
  next();
};
