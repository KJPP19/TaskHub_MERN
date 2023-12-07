const { asyncHandler } = require("../utils/controllerutils");
const {
  addBoardData,
  getBoardsByUserId,
  getBoardByIdAndUserId,
  updateBoardData,
  deleteBoardData,
} = require("../services/boardservices");

const createBoard = asyncHandler(async (req, res) => {
  const board = await addBoardData(req.body, req.user.userId);
  res.status(201).json(board);
});

const getBoards = asyncHandler(async (req, res) => {
  const boards = await getBoardsByUserId(req.user.userId);
  res.status(200).json(boards);
});

const getBoard = asyncHandler(async (req, res) => {
  const board = await getBoardByIdAndUserId(
    req.params.boardId,
    req.user.userId,
  );
  res.status(200).json(board);
});

const boardUpdate = asyncHandler(async (req, res) => {
  const updatedBoard = await updateBoardData(
    req.body,
    req.params.boardId,
    req.user.userId,
  );
  res.status(200).json(updatedBoard);
});

const removeBoard = asyncHandler(async (req, res) => {
  const deletedBoard = await deleteBoardData(
    req.params.boardId,
    req.user.userId,
  );
  res.status(200).json(`${deletedBoard.boardname} has been deleted`);
});

module.exports = {
  createBoard,
  getBoards,
  getBoard,
  boardUpdate,
  removeBoard,
};
