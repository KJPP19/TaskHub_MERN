const request = require("supertest");
require("dotenv").config();
const app = require("../../index");
const mongoose = require("mongoose");
const User = require("../../src/models/userModel");
const { hashPassword } = require("../../src/utils/passwordUtils");

describe("register and login integration tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const existingUserData = {
      email: "initialuser@mail.com",
      firstname: "test",
      lastname: "user",
      password: "123456789",
    };

    const hashedPassword = await hashPassword(existingUserData.password);

    existingUserData.password = hashedPassword;

    await User.create(existingUserData);
  });

  afterEach(async () => {
    const initialUserToDelete = await User.findOne({
      email: "initialuser@mail.com",
    });
    if (initialUserToDelete) {
      await User.deleteOne({ _id: initialUserToDelete._id });
    }

    const testUserToDelete = await User.findOne({
      email: "test2122@mail.com",
    });
    if (testUserToDelete) {
      await User.deleteOne({ _id: testUserToDelete._id });
    }
  });

  describe("POST /api/v1/register", () => {
    it("should register new user and return 201 status", async () => {
      const userData = {
        email: "test2122@mail.com",
        firstname: "test",
        lastname: "user",
        password: "123456789",
      };
      const response = await request(app)
        .post("/api/v1/register")
        .send(userData)
        .expect(201);
      expect(response.body.message).toBe("successfully created an account");

      //check if user is stored in the database
      const userInDatabase = await User.findOne({ email: userData.email });
      expect(userInDatabase).toBeDefined();
      expect(userInDatabase.firstname).toBe(userData.firstname);
      expect(userInDatabase.lastname).toBe(userData.lastname);
    });

    it("should not register existing user", async () => {
      const userData = {
        email: "initialuser@mail.com",
        firstname: "test",
        lastname: "user",
        password: "123456789",
      };
      const response = await request(app)
        .post("/api/v1/register")
        .send(userData)
        .expect(400);
      expect(response.body.error.message).toBe("email already exist");
      const userInDatabase = await User.count({ email: userData.email });
      expect(userInDatabase).toBe(1);
    });

    it("should not register user with invalid email and returns validation error", async () => {
      const userData = {
        email: "testuser",
        firstname: "test",
        lastname: "user",
        password: "123456789",
      };
      const response = await request(app)
        .post("/api/v1/register")
        .send(userData)
        .expect(422);
      expect(response.body.error.message).toBe(
        "invalid email, please enter a valid email.",
      );
      const userInDatabase = await User.count({ email: userData.email });
      expect(userInDatabase).toBe(0);
    });

    it("should return validation error if email field is not specified", async () => {
      const noUserEmailData = {
        firstname: "test",
        lastname: "user",
        password: "123456789",
      };
      const response = await request(app)
        .post("/api/v1/register")
        .send(noUserEmailData)
        .expect(422);
      expect(response.body.error.message).toBe("Email is required.");
      const userInDatabase = await User.count({ email: noUserEmailData.email });
      expect(userInDatabase).toBe(0);
    });

    it("should return validation error if fields are empty", async () => {
      const EmptyData = {};
      const response = await request(app)
        .post("/api/v1/register")
        .send(EmptyData)
        .expect(422);
      expect(response.body.error.message).toBe(
        "Email is required.,firstname is required.,lastname is required.,password is required.",
      );
    });

    it("should return validation error if minimum characters is not met", async () => {
      const userData = {
        email: "testuser2@mail.com",
        firstname: "k",
        lastname: "d",
        password: "123",
      };
      const response = await request(app)
        .post("/api/v1/register")
        .send(userData)
        .expect(422);
      expect(response.body.error.message).toBe(
        "firstname should be atleast 2 characters long,lastname should be atleast 2 characters long,password should be atleast 6 characters long",
      );
    });
  });

  describe("POST /api/v1/login", () => {
    it("should generate access and refresh token if email and password is valid", async () => {
      const loginData = {
        email: "initialuser@mail.com",
        password: "123456789",
      };
      const response = await request(app)
        .post("/api/v1/login")
        .send(loginData)
        .expect(200);
      expect(response.body.message).toBe("all credentials are valid");
      expect(response.body.accesstoken).toBeDefined();
      expect(response.body.refreshtoken).toBeDefined();
    });

    it("should return an error if user email is incorrect", async () => {
      const loginData = {
        email: "wronguser@mail.com",
        password: "123456789",
      };
      const response = await request(app)
        .post("/api/v1/login")
        .send(loginData)
        .expect(400);
      expect(response.body.error.message).toBe("Wrong email address");
    });

    it("should return an error if user password is incorrect", async () => {
      const loginData = {
        email: "initialuser@mail.com",
        password: "123456",
      };
      const response = await request(app)
        .post("/api/v1/login")
        .send(loginData)
        .expect(400);
      expect(response.body.error.message).toBe("wrong password");
    });
  });
});
