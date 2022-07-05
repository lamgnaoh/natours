// file server.js chỉ để chứa các đoạn code riêng biệt không sử dụng express, chỉ chứa các đoạn code cấu hình cho server vd listen port , database configuration , biến môi trường evn , handling error ,...
const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const Tour = require("../../model/tourModel");

dotenv.config({
  path: `${__dirname}/../../config.env`,
});

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
// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf8"));

// import data in database
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("data successfully imported");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
// delete all data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("data successfully delete");
    process.exit();
  } catch (err) {
    console.log(err);
  }
};
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
console.log(process.argv);
