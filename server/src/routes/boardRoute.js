const express = require("express");
const router = express.Router();
const boardController = require("../controllers/boardController");
const boardSchema = require("../schemas/boardSchema");
const validateObjectId = require("../middleware/objectIdValidation");
const { verifyAccessToken } = require("../middleware/verifyJWT");
const { validateRequest } = require("../middleware/validaterequest");

router.get("/", verifyAccessToken, boardController.getBoards);
router.post(
  "/",
  verifyAccessToken,
  validateRequest(boardSchema),
  boardController.createBoard,
);
router.get(
  "/:boardId",
  verifyAccessToken,
  validateObjectId,
  boardController.getBoard,
);
router.put(
  "/:boardId",
  verifyAccessToken,
  validateObjectId,
  validateRequest(boardSchema),
  boardController.boardUpdate,
);
router.delete(
  "/:boardId",
  verifyAccessToken,
  validateObjectId,
  boardController.removeBoard,
);

module.exports = router;
