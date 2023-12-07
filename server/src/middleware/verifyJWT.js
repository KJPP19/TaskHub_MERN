const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/generateJWTutils");
require("dotenv").config();

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "no authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Token has expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

const verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = {
      _id: decoded.userId,
      email: decoded.userEmail,
    };
    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
    next();
  } catch (error) {
    return res.status(401).json({ error: "invalid token" });
  }
};

module.exports = { verifyAccessToken, verifyRefreshToken };
