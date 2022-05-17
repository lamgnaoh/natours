const express = require("express");
const router = express.Router();
const tourController = require("../controller/tourController");
// param middleware : là một middleware chỉ chạy cho một số URL có parameter nhất định.
//vd: param middleware này chỉ chạy với các router có param id : /api/v1/tours/:id

// param middleware cx là một middleware -> được thêm vào trong middleware stack

// vd: router.param("id", tourController.checkId);

router
  .route("/top-5-best-and-cheap")
  .get(tourController.aliasTopTours, tourController.getAllTour);

router
  // do đã gán tourRouter vào trong app.use('/api/v1/tours') nên các route của tourRouter chỉ còn cần "/" là được
  // match với '/api/v1/tours/'
  .route("/")
  .get(tourController.getAllTour)
  .post(tourController.createNewTour);
router
  // match với "/api/v1/tours/:id"
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);
module.exports = router;
