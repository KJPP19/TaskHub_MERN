const request = require("supertest");
require("dotenv").config();
const app = require("../../index");
const mongoose = require("mongoose");
const User = require("../../src/models/userModel");
const Board = require("../../src/models/boardModel");
const { hashPassword } = require("../../src/utils/passwordUtils");

describe("board integration test", () => {
  let accessToken;
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const initialUserData = {
      email: "initialuser2@mail.com",
      firstname: "test",
      lastname: "user",
      password: "123456789",
    };
    const hashedPassword = await hashPassword(initialUserData.password);
    initialUserData.password = hashedPassword;
    const user = await User.create(initialUserData);

    const initialBoardData = {
      boardname: "test board",
      boarddescription: "this is a initial test board for integration test",
      createdby: new mongoose.Types.ObjectId(user._id),
    };
    await Board.create(initialBoardData);
  });

  afterAll(async () => {
    const initialUserToDelete = await User.findOne({
      email: "initialuser2@mail.com",
    });
    if (initialUserToDelete) {
      await User.deleteOne({ _id: initialUserToDelete._id });
    }
    await Board.findOneAndDelete({ boardname: "new test board" });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const validUserCredentials = {
      email: "initialuser2@mail.com",
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

  describe("GET /api/v1/boards", () => {
    it("should GET the boards associated with the valid user", async () => {
      const response = await request(app)
        .get("/api/v1/boards")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body[0].boardname).toBe("test board");
      expect(response.body[0].boarddescription).toBe(
        "this is a initial test board for integration test",
      );
      expect(response.body[0].createdby.email).toBe("initialuser2@mail.com");
    }, 25000);

    it("should not get the boards when access token is invalid or missing", async () => {
      const response = await request(app).get("/api/v1/boards").expect(401);
      expect(response.body.error).toBe("no authorization header");
    });
  });

  describe("POST /api/v1/boards", () => {
    it("should create new board associated with the user, return 201 created", async () => {
      const newBoardData = {
        boardname: "new test board",
        boarddescription: "this is a new test board created",
      };
      const response = await request(app)
        .post("/api/v1/boards")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newBoardData)
        .expect(201);
      const user = await User.findOne({ email: "initialuser2@mail.com" });
      expect(response.body.boardname).toBe(newBoardData.boardname);
      expect(response.body.boarddescription).toBe(
        newBoardData.boarddescription,
      );
      expect(response.body.createdby).toBe(user._id.toString());
    });
    it("should not create new board if access token is invalid, return 401", async () => {
      const newBoardData = {
        boardname: "new test board number 2",
        boarddescription: "this is a new test board to be created without auth",
      };
      const response = await request(app)
        .post("/api/v1/boards")
        .send(newBoardData)
        .expect(401);
      expect(response.body.error).toBe("no authorization header");
    });
    it("should not create new board if minimum characters is not met in each fields, return validation error", async () => {
      const newBoardData = {
        boardname: "my",
        boarddescription: "my board",
      };
      const response = await request(app)
        .post("/api/v1/boards")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newBoardData)
        .expect(422);
      expect(response.body.error.message).toBe(
        "board name should be atleast 3 characters long,board description should be atleast 10 characters long",
      );
    });
    it("should not create new board, if no fields have been specified, return validation error", async () => {
      const newBoardData = {};
      const response = await request(app)
        .post("/api/v1/boards")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newBoardData)
        .expect(422);
      expect(response.body.error.message).toBe(
        "board name is required,board description is required",
      );
    });
  });

  describe("GET /api/v1/boards/:boardId", () => {
    it("should get the board by boardId associated with the user", async () => {
      const board = await Board.findOne({ boardname: "test board" });
      const boardId = board._id.toString();
      const response = await request(app)
        .get(`/api/v1/boards/${boardId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty("_id", boardId);
      expect(response.body).toHaveProperty("boardname", "test board");
    });

    it("should handle invalid boardId and return an error", async () => {
      const boardId = "123abcx23";
      const response = await request(app)
        .get(`/api/v1/boards/${boardId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(400);
      expect(response.body.error).toHaveProperty(
        "message",
        "invalid object ID",
      );
      expect(response.body.error).toHaveProperty(
        "detail",
        "object ID does not exist, invalid ID",
      );
    });

    it("should not access the board without a valid access token, return 401", async () => {
      const board = await Board.findOne({ boardname: "test board" });
      const boardId = board._id.toString();
      const response = await request(app)
        .get(`/api/v1/boards/${boardId}`)
        .expect(401);
      expect(response.body).toHaveProperty("error", "no authorization header");
    });
  });

  describe("PUT /api/v1/boards/:boardId", () => {
    it("should update existing board, return 200 status", async () => {
      const boardData = {
        boardname: "board latest update",
        boarddescription: "this board has been updated",
      };
      const board = await Board.findOne({ boardname: "test board" });
      const boardId = board._id.toString();
      const response = await request(app)
        .put(`/api/v1/boards/${boardId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(boardData)
        .expect(200);
      expect(response.body).toHaveProperty("boardname", boardData.boardname);
      expect(response.body).toHaveProperty(
        "boarddescription",
        boardData.boarddescription,
      );
    });
  });

  describe("DELETE /api/v1/boards/:boardId", () => {
    it("should delete specific board", async () => {
      const board = await Board.findOne({ boardname: "board latest update" });
      const boardId = board._id.toString();
      const response = await request(app)
        .delete(`/api/v1/boards/${boardId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toBe(`${board.boardname} has been deleted`);
    });
  });
});
