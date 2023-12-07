const asyncHandler = (controllerFunction) => async (req, res, next) => {
  try {
    await controllerFunction(req, res);
  } catch (error) {
    return next(error);
  }
};

module.exports = { asyncHandler };
