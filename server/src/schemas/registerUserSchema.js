const Joi = require("joi");

const registerUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "invalid email, please enter a valid email.",
    "any.required": "Email is required.",
  }),
  firstname: Joi.string().min(2).max(20).required().messages({
    "any.required": "firstname is required.",
    "string.min": "firstname should be atleast 2 characters long",
  }),
  lastname: Joi.string().min(2).max(20).required().messages({
    "any.required": "lastname is required.",
    "string.min": "lastname should be atleast 2 characters long",
  }),
  password: Joi.string().min(6).max(20).required().messages({
    "any.required": "password is required.",
    "string.min": "password should be atleast 6 characters long",
  }),
}).options({ abortEarly: false });

module.exports = registerUserSchema;
