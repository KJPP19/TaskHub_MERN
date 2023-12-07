const authenticationservice = require("../../src/services/authenticationservice");
const {
  hashPassword,
  decryptHashedPassword,
} = require("../../src/utils/passwordUtils");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../src/utils/generateJWTutils");
const { APIError } = require("../../src/middleware/customerrors");
const User = require("../../src/models/userModel");

jest.mock("../../src/models/userModel", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../src/utils/passwordUtils", () => ({
  hashPassword: jest.fn(),
  decryptHashedPassword: jest.fn(),
}));

jest.mock("../../src/utils/generateJWTutils", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));

describe("userService", () => {
  describe("Register User", () => {
    it("should create a new user", async () => {
      const userData = {
        email: "testuser@sample.com",
        firstname: "test",
        lastname: "user",
        password: "123456789",
      };
      User.findOne.mockResolvedValue(null);
      hashPassword.mockResolvedValue("hashedPassword");
      await authenticationservice.register(userData);
      expect(User.create).toHaveBeenCalledWith({
        email: "testuser@sample.com",
        firstname: "test",
        lastname: "user",
        password: "hashedPassword",
      });
    });
    it("should throw an error if the user already exists", async () => {
      const userData = {
        email: "testuser@sample.com",
        firstname: "test",
        lastname: "user",
        password: "123456789",
      };
      User.findOne.mockResolvedValue({ email: "testuser@sample.com" });
      await expect(authenticationservice.register(userData)).rejects.toThrow(
        APIError,
      );
    });
    it("should hash the password before saving", async () => {
      const userData = {
        email: "testuser@sample.com",
        firstname: "test",
        lastname: "user",
        password: "123456789",
      };
      User.findOne.mockResolvedValue(null);
      await authenticationservice.register(userData);
      expect(hashPassword).toHaveBeenCalledWith("123456789");
    });
  });
  describe("login user", () => {
    it("should generate access and refresh token with valid email and password", async () => {
      const userData = {
        email: "userlogintest@mail.com",
        password: "123456789",
      };
      User.findOne.mockResolvedValue({ email: "userlogintest@mail.com" });
      decryptHashedPassword.mockResolvedValue(true);
      generateAccessToken.mockReturnValue("mockAccessToken");
      generateRefreshToken.mockReturnValue("mockRefreshToken");
      const result = await authenticationservice.login(userData);

      expect(result.accessToken).toEqual("mockAccessToken");
      expect(result.refreshToken).toEqual("mockRefreshToken");
    });
    it("should throw an error if the user does not exist", async () => {
      const userData = {
        email: "testuser@mail.com",
        password: "123456789",
      };
      User.findOne.mockResolvedValue(null);
      await expect(authenticationservice.login(userData)).rejects.toThrow(
        APIError,
      );
    });
    it("should throw an error if password is incorrect", async () => {
      const userData = {
        email: "testuser@mail.com",
        password: "123456789",
      };
      User.findOne.mockResolvedValue(null);
      decryptHashedPassword.mockResolvedValue(false);
      await expect(authenticationservice.login(userData)).rejects.toThrow(
        APIError,
      );
    });
  });
});
