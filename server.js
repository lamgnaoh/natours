// file server.js chỉ để chứa các đoạn code riêng biệt không sử dụng express, chỉ chứa các đoạn code cấu hình cho server vd listen port , database configuration , biến môi trường evn , handling error ,...
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Uncaught Exceptions
// uncaught exception là các lỗi  xảy ra trong các đoạn code đồng bộ nhưng chưa được xử lý

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception !!! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({
  path: `${__dirname}/config.env`,
});
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
// mongoose.connect tra ve 1 promise
mongoose
  // connect tới local dababase
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((conn) => {
    // console.log(conn.connections);
    console.log("DB connection successfully");
  });

//4, start server
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port} ... `);
});

// Unhandled Rejections
// mỗi khi có một rejection không được xử lý (của 1 promise) (không được catch) -> đối tượng process sẽ phát ra 1 sự kiện là unhandleRejection
// xử lý sự kiện  unhandleRejection ở đây
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection !!! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
