// /config/multerConfig.js
const multer = require("multer");

// Using the simple disk storage with a destination folder "uploads/"
const upload = multer({ dest: "uploads/" });

module.exports = upload;
