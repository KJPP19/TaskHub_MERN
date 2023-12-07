const Joi = require("joi");

const columnSchema = Joi.object({
  columnname: Joi.string().min(2).max(15).required(),
});

module.exports = columnSchema;
