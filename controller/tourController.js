const Tour = require("../model/tourModel");
const APIFeature = require("../utils/apiFeature");

//2, Route handler
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  req.query.fields = "name,price,ratingsAverage,summary,difficulty";
  next();
};

// get all tours
exports.getAllTour = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

// get tour by id
exports.getTour = async (req, res) => {
  try {
    // req.params là 1 object chứa tất cả các variable và giá trị của chúng trong đường dẫn url
    /*
    optional params :
    vd: /api/v1/tours/:id/:x/:y?
    -> khi client gửi request tới /api/v1/tours/5/22 thì không xảy ra lỗi , và req.params trả về { id: 5 , x: 22, y: undefined}
    */

    // query tour trong mongoose bang id

    const tour = await Tour.findById(req.params.id);
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
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
// create new tour
exports.createNewTour = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};
// update tour

exports.updateTour = async (req, res) => {
  try {
    // Tour.findByIdAndUpdate(id, object data update  , object options { new: true -> tra ve tour được update chứ không phải tour gốc ban đầu  , runValidators: true -> run validator với data được truyền từ req.body  xem có thoả mãn schema hay không }   )
    const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
// delete tour
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};
