const Joi = require("joi");

const boardSchema = Joi.object({
  boardname: Joi.string().min(3).max(30).required().messages({
    "string.boardname": "invalid board name, please enter a valid board name",
    "any.required": "board name is required",
    "string.min": "board name should be atleast 3 characters long",
  }),
  boarddescription: Joi.string().min(10).max(200).required().messages({
    "string.boarddescription":
      "invalid board description, please enter a valid board description",
    "any.required": "board description is required",
    "string.min": "board description should be atleast 10 characters long",
  }),
}).options({ abortEarly: false });

module.exports = boardSchema;
