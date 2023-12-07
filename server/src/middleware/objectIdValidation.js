const mongoose = require("mongoose");
const { APIError } = require("./customerrors");

const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.boardId)) {
    throw new APIError(
      "invalid object ID",
      400,
      "object ID does not exist, invalid ID",
    );
  }
  next();
};

module.exports = validateObjectId;
