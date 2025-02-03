const express = require("express");
const fileUploadController = require("../controllers/fileUploadController");
const verifyToken = require("../middlewares/jwtMiddleware");

const router = express.Router();

router.post(
  "/statement",
  verifyToken,
  fileUploadController.upload,
  fileUploadController.uploadStatement
);
//reupload statement
router.post("/reupload", verifyToken, fileUploadController.reuploadStatement);
module.exports = router;
