const request = require("supertest");
require("dotenv").config();
const app = require("../../index");
const mongoose = require("mongoose");
const User = require("../../src/models/userModel");
const Board = require("../../src/models/boardModel");
const { hashPassword } = require("../../src/utils/passwordUtils");

describe("board member integration test", () => {
  let accessToken;
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const boardCreatorData = {
      email: "initialuser4@mail.com",
      firstname: "test",
      lastname: "user",
      password: "123456789",
    };
    const firstMemberData = {
      email: "initialuser5@mail.com",
      firstname: "seconduser",
      lastname: "second",
      password: "123456789",
    };
    const hashedPassword1 = await hashPassword(boardCreatorData.password);
    const hashedPassword2 = await hashPassword(firstMemberData.password);
    boardCreatorData.password = hashedPassword1;
    firstMemberData.password = hashedPassword2;
    const boardCreator = await User.create(boardCreatorData);
    const firstMember = await User.create(firstMemberData);

    const initialBoardData = {
      boardname: "e-commerce product page",
      boarddescription: "implementation of product page",
      createdby: new mongoose.Types.ObjectId(boardCreator._id),
    };
    const board = await Board.create(initialBoardData);
    await Board.updateOne(
      { _id: board._id },
      { $push: { teammember: firstMember._id } },
    );
  });

  afterAll(async () => {
    const usersToDelete = [
      "initialuser4@mail.com",
      "initialuser5@mail.com",
      "initialuser6@mail.com",
    ];
    await User.deleteMany({ email: { $in: usersToDelete } });
    await Board.findOneAndDelete({ boardname: "e-commerce product page" });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const validUserCredentials = {
      email: "initialuser4@mail.com",
      password: "123456789",
    };
    const response = await request(app)
      .post("/api/v1/login")
      .send(validUserCredentials)
      .expect(200);
    accessToken = response.body.accesstoken;
  });

  afterEach(async () => {
    accessToken = undefined;
  });

  describe("GET /api/v1/boards/:boardId/members", () => {
    it("should get the member/s of a specific board, return 200", async () => {
      const board = await Board.findOne({
        boardname: "e-commerce product page",
      });
      const boardId = board._id.toString();
      const response = await request(app)
        .get(`/api/v1/boards/${boardId}/members`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body[0]).toHaveProperty("email", "initialuser5@mail.com");
    });

    it("should not access the member/s of the board without a valid access token", async () => {
      const board = await Board.findOne({
        boardname: "e-commerce product page",
      });
      const boardId = board._id.toString();
      const response = await request(app)
        .get(`/api/v1/boards/${boardId}/members`)
        .expect(401);
      expect(response.body).toHaveProperty("error", "no authorization header");
    });

    it("should handle invalid boardId, return 404 status", async () => {
      const boardId = "123abcxz";
      const response = await request(app)
        .get(`/api/v1/boards/${boardId}/members`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(response.body.error).toHaveProperty(
        "message",
        "invalid object ID",
      );
    });
  });

  describe("POST /api/v1/boards/:boardId/members", () => {
    it("should add a valid user to the board member", async () => {
      const newUserData = {
        email: "initialuser6@mail.com",
        firstname: "test",
        lastname: "user",
        password: "123456789",
      };
      const hashedPassword = await hashPassword(newUserData.password);
      newUserData.password = hashedPassword;
      const user = await User.create(newUserData);
      const addUserToMemberData = {
        userEmail: newUserData.email,
      };
      const board = await Board.findOne({
        boardname: "e-commerce product page",
      });
      const boardId = board._id.toString();
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/members`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(addUserToMemberData)
        .expect(200);
      expect(response.body.teammember).toContain(user._id.toString());
    });

    it("should not add the board creator", async () => {
      const board = await Board.findOne({
        boardname: "e-commerce product page",
      });
      const boardId = board._id.toString();
      const invalidUserEmail = {
        userEmail: "initialuser4@mail.com",
      };
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/members`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(invalidUserEmail)
        .expect(403);
      expect(response.body.error).toHaveProperty(
        "message",
        "cannot add creator",
      );
    });

    it("should handle adding invalid user to member", async () => {
      const invalidUserEmail = {
        userEmail: "invuser@mail.com",
      };
      const board = await Board.findOne({
        boardname: "e-commerce product page",
      });
      const boardId = board._id.toString();
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/members`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(invalidUserEmail)
        .expect(400);
      expect(response.body.error).toHaveProperty(
        "message",
        "user email does not exist",
      );
    });

    it("should handle duplicate user in board member", async () => {
      const userEmailData = {
        userEmail: "initialuser5@mail.com",
      };
      const board = await Board.findOne({
        boardname: "e-commerce product page",
      });
      const boardId = board._id.toString();
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/members`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(userEmailData);
      expect(response.body.error).toHaveProperty("message", "member duplicate");
    });
  });

  describe("DELETE /api/v1/boards/:boardId/members/:memberId", () => {
    it("should delete or remove a member", async () => {
      const board = await Board.findOne({
        boardname: "e-commerce product page",
      });
      const boardId = board._id.toString();
      const memberId = board.teammember[0].toString();
      const response = await request(app)
        .delete(`/api/v1/boards/${boardId}/members/${memberId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty(
        "message",
        `deleted user with an ID ${memberId}`,
      );
    });
  });
});
