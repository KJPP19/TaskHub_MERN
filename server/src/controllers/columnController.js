const { asyncHandler } = require("../utils/controllerutils");
const {
  getColumnsByBoardId,
  addColumnData,
  updateColumnData,
  deleteColumnData,
} = require("../services/columnservice");

const getColumns = asyncHandler(async (req, res) => {
  const columns = await getColumnsByBoardId(
    req.params.boardId,
    req.user.userId,
  );
  res.status(200).json(columns);
});

const createColumn = asyncHandler(async (req, res) => {
  const column = await addColumnData(
    req.body,
    req.params.boardId,
    req.user.userId,
  );
  res.status(201).json(column);
});

const updateColumn = asyncHandler(async (req, res) => {
  const updatedColumn = await updateColumnData(
    req.body,
    req.params.boardId,
    req.params.columnId,
    req.user.userId,
  );
  res.status(200).json(updatedColumn);
});

const deleteColumn = asyncHandler(async (req, res) => {
  await deleteColumnData(
    req.params.boardId,
    req.params.columnId,
    req.user.userId,
  );
  res.status(200).json({ message: "column deleted" });
});

module.exports = { getColumns, createColumn, updateColumn, deleteColumn };
