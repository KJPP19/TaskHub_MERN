const express = require("express");
const router = express.Router();
const columnController = require("../controllers/columnController");
const columnSchema = require("../schemas/columnSchema");
const validateObjectId = require("../middleware/objectIdValidation");
const { verifyAccessToken } = require("../middleware/verifyJWT");
const { validateRequest } = require("../middleware/validaterequest");

router.get(
  "/boards/:boardId/columns",
  verifyAccessToken,
  validateObjectId,
  columnController.getColumns,
);
router.post(
  "/boards/:boardId/columns",
  verifyAccessToken,
  validateObjectId,
  validateRequest(columnSchema),
  columnController.createColumn,
);
router.put(
  "/boards/:boardId/columns/:columnId",
  verifyAccessToken,
  validateObjectId,
  validateRequest(columnSchema),
  columnController.updateColumn,
);
router.delete(
  "/boards/:boardId/columns/:columnId",
  verifyAccessToken,
  validateObjectId,
  columnController.deleteColumn,
);

module.exports = router;
