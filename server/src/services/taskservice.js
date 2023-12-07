const Board = require("../models/boardModel");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Column = require("../models/columnModel");
const { APIError } = require("../middleware/customerrors");

const checkBoard = async (boardId, userId) => {
  const boardExist = await Board.findOne({ _id: boardId, createdby: userId });
  if (!boardExist) {
    throw new APIError("board not found", 404, "board does not exist");
  }
  return boardExist;
};

const checkUserExist = async (userEmail) => {
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw new APIError(
      "user not found",
      404,
      "user does not exist, verify if the user email is correct",
    );
  }
  return user;
};

const checkMemberExistInBoard = async (boardId, userId) => {
  const member = await Board.exists({ _id: boardId, teammember: userId });
  if (!member) {
    throw new APIError(
      "user is not a member",
      404,
      "user does not exist in the board, verify if user was added to the board",
    );
  }
  return member;
};

const checkColumnExistInBoard = async (boardId, columnId) => {
  const column = await Board.exists({ _id: boardId, columns: columnId });
  if (!column) {
    throw new APIError(
      "column not found",
      404,
      "column does not exist in the board, verify the column",
    );
  }
  return column;
};

const addTaskInBoard = async (taskData, boardId, userId) => {
  const { tasksummary, taskdescription, assignedto, status } = taskData;
  const getBoard = await checkBoard(boardId, userId);
  let assignedtoUserId = null;
  if (assignedto !== undefined) {
    const userExist = await checkUserExist(assignedto);
    await checkMemberExistInBoard(getBoard._id, userExist._id);
    assignedtoUserId = userExist._id;
  }
  await checkColumnExistInBoard(getBoard._id, status);
  const createTask = await Task.create({
    tasksummary,
    taskdescription,
    assignedto: assignedtoUserId,
    status,
  });
  await Column.updateOne({ _id: status }, { $push: { tasks: createTask._id } });
  return createTask;
};

const updateTaskInBoard = async (taskData, boardId, userId, taskId) => {
  const { tasksummary, taskdescription, assignedto, status } = taskData;
  const getBoard = await checkBoard(boardId, userId);
  let assignedtoUserId = null;
  if (assignedto !== undefined) {
    const userExist = await checkUserExist(assignedto);
    await checkMemberExistInBoard(getBoard._id, userExist._id);
    assignedtoUserId = userExist._id;
  }
  await checkColumnExistInBoard(getBoard._id, status);
  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    {
      tasksummary,
      taskdescription,
      assignedto: assignedtoUserId,
      status,
    },
    { new: true },
  );
  if (!updatedTask) {
    throw new APIError("task not found", 404, "unable to update the task");
  }
  return updatedTask;
};

const deleteTaskInBoard = async (boardId, userId, taskId) => {
  await checkBoard(boardId, userId);
  const deleteTask = await Task.findByIdAndDelete(taskId);
  if (!deleteTask) {
    throw new APIError("task not found", 404, "unable to delete the task");
  }
  return deleteTask;
};

module.exports = {
  addTaskInBoard,
  updateTaskInBoard,
  deleteTaskInBoard,
};
