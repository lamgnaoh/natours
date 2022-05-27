const Tour = require("../model/tourModel");
const APIFeature = require("../utils/apiFeature");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
//2, Route handler

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

// get all tours
exports.getAllTour = catchAsync(async (req, res, next) => {
  /**
     * req.query lưu các parameter trong đường dẫn dưới dạng object

          VD: /tour?duration = 5 & difficulties = easy

          -> req.query = {

          duration: "5" , // chu y : cac gia tri trong req.query deu duoi dang string

          difficulties: "easy"

          }
     */
  // Build query

  const features = new APIFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .limit()
    .pagination();
  // EXECUTE QUERY
  const tours = await features.query;
  // const  tours = await Tour.find().where("duration").equals(5).where("difficulties").equals('easy');

  // gửi dũ liệu cho client dưới dạng json
  // trong res.json đã chứa JSON.parse
  res.status(200).json({
    status: "success",
    requestAt: req.requestTime,
    result: tours.length,
    data: {
      tours: tours,
    },
  });
});

// get tour by id
exports.getTour = catchAsync(async (req, res, next) => {
  // req.params là 1 object chứa tất cả các variable và giá trị của chúng trong đường dẫn url
  /*
    optional params :
    vd: /api/v1/tours/:id/:x/:y?
    -> khi client gửi request tới /api/v1/tours/5/22 thì không xảy ra lỗi , và req.params trả về { id: 5 , x: 22, y: undefined}
    */

  // query tour trong mongoose bang id

  const tour = await Tour.findById(req.params.id);
  if (!tour) return next(new AppError("No tour found with that id"), 404);
  // Tour.findById là shorthand của phương thức findOne(filter object)
  // const tour = await Tour.findOne({
  //   _id: req.params.id,
  // });

  // chuyển đổi chuỗi trong giá trị của thuộc tính id thành số
  // C1
  // const id = parseInt(req.params.id);
  // C2
  // const id = req.params.id * 1;

  res.status(200).json({
    status: "success",
    data: {
      tour: tour,
    },
  });
});

// create new tour
exports.createNewTour = catchAsync(async (req, res, next) => {
  // tao 1 tour document mới trong database

  // c1
  // const newTour = new Tour(req.body);
  // newTour.save().then();

  // c2
  // tour.create tra ve 1 promise -> su dung async await
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});
// update tour

exports.updateTour = catchAsync(async (req, res, next) => {
  // Tour.findByIdAndUpdate(id, object data update  , object options { new: true -> tra ve tour được update chứ không phải tour gốc ban đầu  , runValidators: true -> run validator với data được truyền từ req.body  xem có thoả mãn schema hay không }   )
  const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!newTour) return next(new Error("No tour found with that id"), 404);

  res.status(200).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});
// delete tour
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) return next(new Error("No tour found with that id"), 404);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// stats tour
exports.getTourStats = catchAsync(async (req, res, next) => {
  //aggregate: định nghĩa 1 pipeline mà tất cả các document từ 1 collection đều đi qua và đi qua từng stage để biến đổi chúng thành các kết quả được tổng hợp
  const stats = await Tour.aggregate([
    // stage 1
    {
      $match: {
        ratingsAverage: {
          $gte: 4.7,
        },
      },
    },
    // stage 2
    {
      $group: {
        /**
         * _id: có thể có các giá trị như $<field name > hoặc giá trị null hoặc 1 giá trị  constant
         * nếu _id có giá trị null hoặc constant -> $group sẽ tính toán các giá trị của các trường (sum, ratingsQuantity,ratingAverage,minPrice ,maxPrice) cho tất cả các document đầu vào
         * nếu _id có giá trị $<field name> -> $group sẽ tính toán các giá trị của các trường (sum, ratingsQuantity,ratingAverage,minPrice ,maxPrice) cho các document được nhóm bởi các giá trị của trường <field name> đó
         */
        _id: "$difficulty",
        sum: { $sum: 1 },
        numRatings: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
    // với cac stage sau stage group thì phải dùng các trường trong stage group vì lúc này trong stage group đang là 1 document mới sẽ được trả về cho client
    {
      $sort: { avgRating: -1 }, // giảm dần
    },
    // {
    //   $match: { avgRating: { $gte: 4.8 } },
    // },
  ]);
  // await Tour.aggregate trả về document
  res.status(200).json({
    status: "success",
    data: {
      stats: stats,
    },
  });
});

// month plans
exports.getMonthlyPlans = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  console.log(year);
  const plans = await Tour.aggregate([
    // giải cấu trúc (destrucruting) một trường trong document có giá trị là 1 mảng thành các document có giá trị của trường đó là 1 element trong mảng

    {
      $unwind: {
        path: "$startDates",
      },
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: "$startDates",
        },
        numTour: { $sum: 1 },
        nameTours: { $push: "$name" },
      },
    },
    {
      $addFields: { month: "$_id" },
    },
    {
      $sort: { month: -1 },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      plans: plans,
    },
  });
});
