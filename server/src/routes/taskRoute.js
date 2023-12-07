const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { verifyAccessToken } = require("../middleware/verifyJWT");

router.post(
  "/boards/:boardId/tasks",
  verifyAccessToken,
  taskController.addTask,
);
router.put(
  "/boards/:boardId/tasks/:taskId",
  verifyAccessToken,
  taskController.updateTask,
);
router.delete(
  "/boards/:boardId/tasks/:taskId",
  verifyAccessToken,
  taskController.deleteTask,
);

module.exports = router;
