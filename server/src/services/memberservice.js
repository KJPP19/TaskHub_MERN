const Board = require("../models/boardModel");
const User = require("../models/userModel");
const { APIError } = require("../middleware/customerrors");

const checkBoard = async (boardId, userId) => {
  const boardExist = await Board.findOne({
    _id: boardId,
    createdby: userId,
  }).populate({ path: "teammember", select: "-password -firstname -lastname" });
  if (!boardExist) {
    throw new APIError("board not found", 404, "board does not exist");
  }
  return boardExist;
};

const getMembersInBoard = async (boardId, userId) => {
  const getBoard = await checkBoard(boardId, userId);
  const getMembers = getBoard.teammember;
  return getMembers;
};

const addMemberByEmail = async (userEmailData, boardId, userId) => {
  const { userEmail } = userEmailData;
  const getBoard = await checkBoard(boardId, userId);
  const userEmailExist = await User.findOne({ email: userEmail });
  if (!userEmailExist) {
    throw new APIError(
      "user email does not exist",
      400,
      "Email address specified does not exist, check the email again",
    );
  }
  if (String(userEmailExist._id) === String(getBoard.createdby)) {
    throw new APIError(
      "cannot add creator",
      403,
      "forbidden, you cannot add yourself to the member of your own board",
    );
  }
  const memberExist = getBoard.teammember.find(
    (member) => String(member._id) === String(userEmailExist._id),
  );

  if (memberExist) {
    throw new APIError(
      "member duplicate",
      400,
      "user already exist on this board",
    );
  }
  await Board.findByIdAndUpdate(getBoard._id, {
    $push: { teammember: userEmailExist._id },
  });
  const updatedBoard = await Board.findById(boardId);
  return updatedBoard;
};

const removeMemberInBoard = async (boardId, userId, memberId) => {
  const getBoard = await checkBoard(boardId, userId);
  const removeMember = await Board.findByIdAndUpdate(getBoard._id, {
    $pull: { teammember: memberId },
  });
  if (!removeMember) {
    throw new APIError(
      "member not found",
      404,
      "unable to found the member in your board, delete process failed",
    );
  }
};

module.exports = {
  getMembersInBoard,
  addMemberByEmail,
  removeMemberInBoard,
};
