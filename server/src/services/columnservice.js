const { APIError } = require("../middleware/customerrors");
const Board = require("../models/boardModel");
const Column = require("../models/columnModel");

const checkBoard = async (boardId, userId) => {
  const boardExist = await Board.findOne({
    _id: boardId,
    createdby: userId,
  }).populate("columns");
  if (!boardExist) {
    throw new APIError("board not found", 404, "board does not exist");
  }
  return boardExist;
};

const getColumnsByBoardId = async (boardId, userId) => {
  const getBoard = await checkBoard(boardId, userId);
  const getColumns = getBoard.columns;
  return getColumns;
};

const addColumnData = async (columnData, boardId, userId) => {
  const { columnname } = columnData;
  const getBoard = await checkBoard(boardId, userId);
  const column = await Column.create({ columnname });
  const columnExist = getBoard.columns.find(
    (col) => col.columnname === columnname,
  );
  if (columnExist) {
    throw new APIError(
      "duplicate column name",
      400,
      `column name already exist in this board, use a different name`,
    );
  }
  await Board.updateOne(
    { _id: getBoard._id },
    { $push: { columns: column._id } },
  );
  return column;
};

const updateColumnData = async (columnData, boardId, columnId, userId) => {
  const { columnname } = columnData;
  await checkBoard(boardId, userId);
  const updateColumn = await Column.findByIdAndUpdate(
    columnId,
    { columnname },
    { new: true },
  );
  if (!updateColumn) {
    throw new APIError("column not found", 404, "column does not exist");
  }
  return updateColumn;
};

const deleteColumnData = async (boardId, columnId, userId) => {
  await checkBoard(boardId, userId);
  const deleteColumn = await Column.findByIdAndDelete(columnId);
  if (!deleteColumn) {
    throw new APIError("column not found", 404, "column does not exist");
  }
};

module.exports = {
  getColumnsByBoardId,
  addColumnData,
  updateColumnData,
  deleteColumnData,
};
