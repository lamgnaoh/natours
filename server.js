// file server.js chỉ để chứa các đoạn code riêng biệt không sử dụng express, chỉ chứa các đoạn code cấu hình cho server vd listen port , database configuration , biến môi trường evn , handling error ,...
const mongoose = require("mongoose");
const dotenv = require("dotenv");
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

app.listen(port, () => {
  console.log(`Listening on port ${port} ... `);
});
