const express = require("express");
const router = express.Router();
const recurringController = require("../controllers/recurringController");
const verifyToken = require("../middlewares/jwtMiddleware");

router.post("/", verifyToken, recurringController.createRecurringItem);
router.get("/", verifyToken, recurringController.getRecurringItems);
router.get("/:id", verifyToken, recurringController.getRecurringItem);
router.put("/:id", verifyToken, recurringController.updateRecurringItem);
router.delete("/:id", verifyToken, recurringController.deleteRecurringItem);

// Special action endpoints
router.patch(
  "/:id/mark-paid",
  verifyToken,
  recurringController.markRecurringItemPaid
);
router.patch("/:id/skip", verifyToken, recurringController.skipRecurringItem);
router.patch(
  "/:id/toggle-autopay",
  verifyToken,
  recurringController.toggleAutopay
);

module.exports = router;
