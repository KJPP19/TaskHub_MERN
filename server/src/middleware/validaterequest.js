const { validationError } = require("../middleware/customerrors");

const validateRequest = (schema) => (req, res, next) => {
  const result = schema.validate(req.body);
  if (result.error) {
    // result.error.details is an array, err represents each items in the array
    // err.message fetches the messages property in the err and stored it in errors
    // therefore one or more errors will be thrown as a response
    const errors = result.error.details.map((err) => err.message);
    throw new validationError(errors);
  }
  next();
};

module.exports = { validateRequest };
