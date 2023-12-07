const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateAccessToken = (user) => {
  const payload = {
    userId: user._id,
    userEmail: user.email,
  };

  const options = {
    expiresIn: "20m",
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
};

const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    userEmail: user.email,
  };

  const options = {
    expiresIn: "5days",
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, options);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
