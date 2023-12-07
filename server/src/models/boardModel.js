const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    boardname: {
      type: String,
      unique: true,
      required: true,
    },
    boarddescription: {
      type: String,
      required: true,
    },
    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    teammember: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    columns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Column" }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Board", boardSchema);
