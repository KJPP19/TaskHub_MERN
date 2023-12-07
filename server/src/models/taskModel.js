const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  tasksummary: {
    type: String,
    required: true,
  },
  taskdescription: {
    type: String,
    required: true,
  },
  assignedto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Column",
  },
});

module.exports = mongoose.model("Task", taskSchema);
