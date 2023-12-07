const { asyncHandler } = require("../utils/controllerutils");
const { register, login } = require("../services/authenticationservice");
const { APIError } = require("../middleware/customerrors");

const registerUser = asyncHandler(async (req, res) => {
  await register(req.body);
  res.status(201).json({ message: "successfully created an account" });
});

const loginUser = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken } = await login(req.body);
  res.status(200).json({
    message: "all credentials are valid",
    accesstoken: accessToken,
    refreshtoken: refreshToken,
  });
});

const refToken = asyncHandler(async (req) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new APIError(
      "authentication failed",
      400,
      "no refresh token provided",
    );
  }
});

module.exports = {
  registerUser,
  loginUser,
  refToken,
};
