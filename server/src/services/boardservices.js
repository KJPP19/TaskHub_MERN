const { APIError } = require("../middleware/customerrors");
const Board = require("../models/boardModel");

const addBoardData = async (boardData, userId) => {
  const { boardname, boarddescription } = boardData;
  const addBoard = await Board.create({
    boardname,
    boarddescription,
    createdby: userId,
  });
  return addBoard;
};

const getBoardsByUserId = async (userId) => {
  const boards = await Board.find({ createdby: userId })
    .populate({
      path: "createdby",
      select: "-password -firstname -lastname",
    })
    .populate({
      path: "teammember",
      select: "-password -firstname -lastname",
    })
    .populate({
      path: "columns",
    });
  return boards;
};

const getBoardByIdAndUserId = async (boardId, userId) => {
  const board = await Board.findOne({ _id: boardId, createdby: userId });
  if (!board) {
    throw new APIError("board not found", 404, "board does not exist");
  }
  return board;
};

const updateBoardData = async (boardData, boardId, userId) => {
  const updateBoard = await Board.findByIdAndUpdate(
    { _id: boardId, createdby: userId },
    boardData,
    { new: true },
  );
  if (!updateBoard) {
    throw new APIError(
      "board not found",
      404,
      "board does not exist and unable to update",
    );
  }
  return updateBoard;
};

const deleteBoardData = async (boardId, userId) => {
  const deleteBoard = await Board.findByIdAndDelete({
    _id: boardId,
    createdby: userId,
  });
  if (!deleteBoard) {
    throw new APIError(
      "board not found",
      404,
      "board does not exist and unable to delete",
    );
  }
  return deleteBoard;
};

module.exports = {
  addBoardData,
  getBoardsByUserId,
  getBoardByIdAndUserId,
  updateBoardData,
  deleteBoardData,
};
