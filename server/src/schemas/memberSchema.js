const Joi = require("joi");

const memberEmailSchema = Joi.object({
  userEmail: Joi.string().email().required(),
});

module.exports = memberEmailSchema;
