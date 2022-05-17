const express = require("express");
const morgan = require("morgan");
const app = express();

//1, Middleware
app.use(morgan("dev"));
app.use(express.static(`${__dirname}/public`));
app.use(express.json());

/**
 * app.use () không định nghĩa route nào áp dụng middleware  -> tất cả các request đến server đều sử dụng hàm middleware đó (do trong app.use() có tham số path mặc định là "/" -> sẽ match tất cả các request đến server. nếu path = "/apple" -> match các request như "/apple" , "/apple/image" ,"/apple/image/5" ...)
 */
app.use("/api/v1/tours", (req, res, next) => {
  console.log("Hello from middleware");

  // luôn luôn phải gọi next() nếu không req ,res sẽ không thể thoát khỏi vòng request -response cycle -> không thể gửi ressponse cho client
  next();
});

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

module.exports = app;
