const Joi = require("joi");

const taskSchema = Joi.object({
  tasksummary: Joi.string().min(5).max(50).required(),
  taskdescription: Joi.string().min(10).max(200).required(),
  assignedto: Joi.string().email().optional(),
  status: Joi.string().required(),
});

module.exports = taskSchema;
