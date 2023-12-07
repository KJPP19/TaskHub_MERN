const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema({
  columnname: {
    type: String,
    required: true,
  },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});

module.exports = mongoose.model("Column", columnSchema);
