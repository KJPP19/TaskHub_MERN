const User = require("../models/userModel");
const {
  hashPassword,
  decryptHashedPassword,
} = require("../utils/passwordUtils");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateJWTutils");
const { APIError } = require("../middleware/customerrors");

const register = async (userData) => {
  const { email, firstname, lastname, password } = userData;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError(
      "email already exist",
      400,
      "this email is already registered",
    );
  }
  const hashedPassword = await hashPassword(password);
  await User.create({ email, firstname, lastname, password: hashedPassword });
};

const login = async (userData) => {
  const { email, password } = userData;
  const user = await User.findOne({ email });
  if (!user || !(await decryptHashedPassword(password, user.password))) {
    throw new APIError(
      "invalid credentials",
      400,
      "The provided email or password is incorrect, please try again",
    );
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

module.exports = {
  register,
  login,
};
