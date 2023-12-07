const { asyncHandler } = require("../utils/controllerutils");
const {
  addTaskInBoard,
  updateTaskInBoard,
  deleteTaskInBoard,
} = require("../services/taskservice");

const addTask = asyncHandler(async (req, res) => {
  const createTask = await addTaskInBoard(
    req.body,
    req.params.boardId,
    req.user.userId,
  );
  res.status(201).json(createTask);
});

const updateTask = asyncHandler(async (req, res) => {
  const updateTask = await updateTaskInBoard(
    req.body,
    req.params.boardId,
    req.user.userId,
    req.params.taskId,
  );
  res.status(200).json(updateTask);
});

const deleteTask = asyncHandler(async (req, res) => {
  await deleteTaskInBoard(
    req.params.boardId,
    req.user.userId,
    req.params.taskId,
  );
  res.status(200).json({ message: "deleted task successfully" });
});

module.exports = { addTask, updateTask, deleteTask };
