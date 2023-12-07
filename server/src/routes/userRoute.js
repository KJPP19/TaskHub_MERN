const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const registerUserSchema = require("../schemas/registerUserSchema");
const { validateRequest } = require("../middleware/validaterequest");
const { verifyRefreshToken } = require("../middleware/verifyJWT");

router.post(
  "/register",
  validateRequest(registerUserSchema),
  userController.registerUser,
);
router.post("/login", userController.loginUser);
router.post("/refreshtoken", verifyRefreshToken, userController.refToken);

module.exports = router;
