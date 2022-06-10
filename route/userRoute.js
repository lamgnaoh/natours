const express = require("express");
// express.Router() trả về 1 middleware. express.Router là một class giúp tạo các route handler trong 1  module riêng  (tức là tạo router ở 1 file khác ) và gắn kết nó với module gốc  ( mountable)
const router = express.Router();

// userController ở đây bằng với đối tượng exports của file userController.js
const userController = require("../controller/userController");
const authController = require("../controller/authController");
// do đã gán userRouter vào trong app.user('/api/v1/users') nên các route của userRouter chỉ còn cần "/" là được

router.patch(
  "/updatePassword",
  authController.protect,
  authController.updatePassword
);
router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.patch("/updateMe", authController.protect, userController.updateMe);
router.delete("/deleteMe", authController.protect, userController.deleteMe);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createNewUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
module.exports = router;
