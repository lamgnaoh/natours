const mongoose = require("mongoose");
// tao 1 schema
const tourSchema = new mongoose.Schema({
  // basic
  // name: String,
  // price: Number,
  // rating: Number,

  // advance:
  name: {
    type: String,
    required: [true, "A name must be defined"],
    unique: true,
  },
  duration: {
    type: Number,
    require: [true, " A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    require: [true, "A tour must have max group size"],
  },
  difficulty: {
    type: String,
    require: [true, " A tour must have a difficulty"],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    require: [true, "A price must be defined"],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    require: [true, " A tour must have summary"],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    require: [true, " A tour must have image cover"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    // select: false -> muốn loại bỏ một số trường (fields) của 1 model  khỏi việc query từ database -> thêm option select: false vào trong Schema của Model đó
  },
  startDates: [Date],
});
// Tao mot model tu schema. model như là một bản thiết kế -> tạo ra document
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
