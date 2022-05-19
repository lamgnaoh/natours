const mongoose = require("mongoose");
const slugify = require("slugify");
// tao 1 schema
const tourSchema = new mongoose.Schema(
  {
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
    slug: {
      type: String,
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
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  // cần phải có các option này thì mới có thể gửi được các trường virtual đến cho client được
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);
// virtual properties là các trường được định nghĩa trong schema nhưng sẽ không được lưu trong DB
tourSchema.virtual("durationInWeek").get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE

//  định nghĩa 1 middleware thực hiện trước / sau khi event xảy ra

tourSchema.pre("save", function (next) {
  // callback function  được thực thi trước khi event save (.save() , .create()) (khi 1 document được lưu vào trong database) xảy ra
  // this trong document middleware này  sẽ trỏ về phía document hiện tại đang được xử lý
  this.slug = slugify(this.name);
  next();
});

// tourSchema.pre("save", function (next) {
//   console.log("Will save document ...");
//   next();
// });

// tourSchema.post("save", function (doc, next) {
//   // callback function  được thực thi sau khi event save (.save() , .create()) (khi 1 document được lưu vào trong database) xảy ra

//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// query middleware sẽ thực thi 1 callback function trước hoặc sau khi 1 query được thực thi
tourSchema.pre(/^find/, function (next) {
  // thực thi callback function trước khi 1 query thực thi
  // this trong query middleware sẽ trỏ tới query object (Ở đây là Tour.find() , Tour.findOne() , Tour.findOneAndUpdate() , ...)
  // ở đây trước khi query Tour.find...() được thực thi thì có 1 query Tour.find({ secretTour: { $ne: true } }) được thực thi

  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.post(/^find/, function (doc, next) {
  console.log(doc);
  next();
});

// Tao mot model tu schema. model như là một bản thiết kế -> tạo ra document
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
