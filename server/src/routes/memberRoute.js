const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { validateRequest } = require("../middleware/validaterequest");
const memberEmailSchema = require("../schemas/memberSchema");
const { verifyAccessToken } = require("../middleware/verifyJWT");
const validateObjectId = require("../middleware/objectIdValidation");

router.get(
  "/boards/:boardId/members",
  verifyAccessToken,
  validateObjectId,
  memberController.MembersInBoard,
);
router.post(
  "/boards/:boardId/members",
  verifyAccessToken,
  validateObjectId,
  validateRequest(memberEmailSchema),
  memberController.addMember,
);
router.delete(
  "/boards/:boardId/members/:memberId",
  verifyAccessToken,
  validateObjectId,
  memberController.removeMember,
);

module.exports = router;
