const request = require("supertest");
require("dotenv").config();
const app = require("../../index");
const mongoose = require("mongoose");
const User = require("../../src/models/userModel");
const Board = require("../../src/models/boardModel");
const Column = require("../../src/models/columnModel");
const { hashPassword } = require("../../src/utils/passwordUtils");

describe("column integration test", () => {
  let accessToken;
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const initialUserData = {
      email: "initialuser3@mail.com",
      firstname: "test",
      lastname: "user",
      password: "123456789",
    };
    const hashedPassword = await hashPassword(initialUserData.password);
    initialUserData.password = hashedPassword;
    const user = await User.create(initialUserData);

    const initialBoardData = {
      boardname: "user authentication",
      boarddescription: "implementation of register and login system",
      createdby: new mongoose.Types.ObjectId(user._id),
    };
    const board = await Board.create(initialBoardData);

    const initialColumnOfBoard = {
      columnname: "to do",
    };
    const column = await Column.create(initialColumnOfBoard);
    await Board.updateOne(
      { _id: board._id },
      { $push: { columns: column._id } },
    );
  });

  afterAll(async () => {
    const columnsToDelete = ["in progress", "to do", "to do's updated"];
    const initialUserToDelete = await User.findOne({
      email: "initialuser3@mail.com",
    });
    if (initialUserToDelete) {
      await User.deleteOne({ _id: initialUserToDelete._id });
    }
    await Column.deleteMany({ columnname: { $in: columnsToDelete } });
    await Board.findOneAndDelete({ boardname: "user authentication" });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const validUserCredentials = {
      email: "initialuser3@mail.com",
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

  describe("GET /api/v1/boards/:boardId/columns", () => {
    it("should get the columns of a specific board by boardId, return 200", async () => {
      const board = await Board.findOne({ boardname: "user authentication" });
      const boardId = board._id.toString();
      const response = await request(app)
        .get(`/api/v1/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body[0]).toHaveProperty("columnname", "to do");
    });

    it("should not access the columns without a valid access token, return 401", async () => {
      const board = await Board.findOne({ boardname: "user authentication" });
      const boardId = board._id.toString();
      const response = await request(app)
        .get(`/api/v1/boards/${boardId}/columns`)
        .expect(401);
      expect(response.body).toHaveProperty("error", "no authorization header");
    });

    it("should handle invalid boardId and return an error", async () => {
      const invalidBoardId = "1234xxzxz23ew";
      const response = await request(app)
        .get(`/api/v1/boards/${invalidBoardId}/columns`)
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
  });

  describe("POST /api/v1/boards/:boardId/columns", () => {
    it("should add a column in a specific board, return 201 status", async () => {
      const newColumnData = {
        columnname: "in progress",
      };
      const board = await Board.findOne({ boardname: "user authentication" });
      const boardId = board._id.toString();
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newColumnData)
        .expect(201);
      expect(response.body).toHaveProperty("columnname", "in progress");
    });

    it("should handle duplicate column name for a specific board, return 400", async () => {
      const existingColumnData = {
        columnname: "to do",
      };
      const board = await Board.findOne({ boardname: "user authentication" });
      const boardId = board._id.toString();
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(existingColumnData)
        .expect(400);
      expect(response.body.error).toHaveProperty(
        "message",
        "duplicate column name",
      );
    });
  });

  describe("PUT /boards/:boardId/columns/:columnId", () => {
    it("should update the column for a specific board", async () => {
      const board = await Board.findOne({ boardname: "user authentication" });
      const column = await Column.findOne({ columnname: "to do" });
      const boardId = board._id.toString();
      const columnId = column._id.toString();
      const updateColumnData = {
        columnname: "to do's updated",
      };
      const response = await request(app)
        .put(`/api/v1/boards/${boardId}/columns/${columnId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateColumnData)
        .expect(200);
      expect(response.body).toHaveProperty("_id", columnId);
      expect(response.body).toHaveProperty(
        "columnname",
        updateColumnData.columnname,
      );
    });
  });

  describe("DELETE /boards/:boardId/columns/:columnId", () => {
    it("should delete the column Id for a specific board", async () => {
      const board = await Board.findOne({ boardname: "user authentication" });
      const column = await Column.findOne({ columnname: "to do's updated" });
      const boardId = board._id.toString();
      const columnId = column._id.toString();
      const response = await request(app)
        .delete(`/api/v1/boards/${boardId}/columns/${columnId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty("message", "column deleted");
    });
  });
});
