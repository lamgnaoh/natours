const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
const app = express();

//1, Middleware
app.use(morgan("dev"));
app.use(express.static(`${__dirname}/public`));
// express.json() là 1 built-in middleware , phân tích JSON ở trong request gửi đến và gán dữ liệu đã được phân tích vào trong req.body
// nếu không có express.json() , req.body = null
app.use(express.json());

/**
 * app.use () không định nghĩa route nào áp dụng middleware  -> tất cả các request đến server đều sử dụng hàm middleware đó (do trong app.use() có tham số path mặc định là "/" -> sẽ match tất cả các request đến server. nếu path = "/apple" -> match các request như "/apple" , "/apple/image" ,"/apple/image/5" ...)
 */
// app.use("/api/v1/tours", (req, res, next) => {
//   console.log("Hello from middleware");

//   // luôn luôn phải gọi next() nếu không req ,res sẽ không thể thoát khỏi vòng request -response cycle -> không thể gửi ressponse cho client
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3, route

// rest api
// Định nghĩa 1 variable trong đường dẫn URL sử dụng  :<tên biến>
// VD: app.get("/api/v1/tours/:id", getTour);

// C1
// app.get("/api/v1/tours", getAllTour);
// app.post("/api/v1/tours", createNewTour);

// C2
const userRouter = require("./route/userRoute");
const tourRouter = require("./route/tourRoute");
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.statusCode = 404;
  // err.status = "fail";

  // khi next nhận 1 argument , express sẽ tự động nhận dạng đó là 1 error , và sau đó sẽ dừng tất cả các middleware khác trong stack , sau đó gửi error đó tới global error handling middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
// Global error handling middleware
app.use(globalErrorHandler);
module.exports = app;
