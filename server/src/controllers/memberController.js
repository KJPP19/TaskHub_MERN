const { asyncHandler } = require("../utils/controllerutils");
const {
  addMemberByEmail,
  getMembersInBoard,
  removeMemberInBoard,
} = require("../services/memberservice");

const MembersInBoard = asyncHandler(async (req, res) => {
  const members = await getMembersInBoard(req.params.boardId, req.user.userId);
  res.status(200).json(members);
});

const addMember = asyncHandler(async (req, res) => {
  const member = await addMemberByEmail(
    req.body,
    req.params.boardId,
    req.user.userId,
  );
  res.status(200).json(member);
});

const removeMember = asyncHandler(async (req, res) => {
  await removeMemberInBoard(
    req.params.boardId,
    req.user.userId,
    req.params.memberId,
  );
  res
    .status(200)
    .json({ message: `deleted user with an ID ${req.params.memberId}` });
});

module.exports = { MembersInBoard, addMember, removeMember };
