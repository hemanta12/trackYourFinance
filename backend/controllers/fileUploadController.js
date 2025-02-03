const statementService = require("../services/statementService");

const logger = require("../utils/logger");
const upload = require("../config/multerConfig");

/**
 * Handle statement file upload.
 */
exports.uploadStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const result = await statementService.processStatementUpload(
      req.user,
      req.file
    );
    res.json(result);
  } catch (error) {
    logger.error("Error in uploadStatement:", error);
    if (error.status === 409) {
      return res.status(409).json({
        message: error.message,
        statement_id: error.statement_id,
      });
    }
    res
      .status(500)
      .json({ message: "Error processing file", error: error.message });
  }
};

/**
 * Handle reupload requests (delete previous statement data).
 */
exports.reuploadStatement = async (req, res) => {
  try {
    const { statement_id } = req.body;
    const result = await statementService.processReuploadStatement(
      req.user,
      statement_id
    );
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing request", error: error.message });
  }
};

// Export the Multer middleware for file uploads.
exports.upload = upload.single("file");
