const request = require("supertest");
require("dotenv").config();
const app = require("../../index");
const mongoose = require("mongoose");
const User = require("../../src/models/userModel");
const Board = require("../../src/models/boardModel");
const Task = require("../../src/models/taskModel");
const Column = require("../../src/models/columnModel");
const { hashPassword } = require("../../src/utils/passwordUtils");

describe("task integration test", () => {
  let accessToken;
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const boardCreatorData = {
      email: "creator@mail.com",
      firstname: "test",
      lastname: "user",
      password: "123456789",
    };
    const memberData = {
      email: "member@mail.com",
      firstname: "test",
      lastname: "user",
      password: "123456789",
    };
    const initialColumnOfBoard = {
      columnname: "done",
    };
    const hashedPasswordForCreator = await hashPassword(
      boardCreatorData.password,
    );
    const hashedPasswordForMember = await hashPassword(memberData.password);
    boardCreatorData.password = hashedPasswordForCreator;
    memberData.password = hashedPasswordForMember;
    const boardCreator = await User.create(boardCreatorData);
    const boardMember = await User.create(memberData);

    const initialBoardData = {
      boardname: "product list",
      boarddescription: "implementation of product list",
      createdby: new mongoose.Types.ObjectId(boardCreator._id),
    };
    const board = await Board.create(initialBoardData);
    const column = await Column.create(initialColumnOfBoard);
    await Board.updateOne(
      { _id: board._id },
      { $push: { columns: column._id } },
    );
    await Board.updateOne(
      { _id: board._id },
      { $push: { teammember: boardMember._id } },
    );
  });

  afterAll(async () => {
    const usersToDelete = ["creator@mail.com", "member@mail.com"];
    const columnToDelete = ["done", "review"];
    const taskToDelete = ["show product quantity", "show price of the product"];
    await User.deleteMany({ email: { $in: usersToDelete } });
    await Board.findOneAndDelete({ boardname: "product list" });
    await Column.deleteMany({ columnname: { $in: columnToDelete } });
    await Task.deleteMany({ tasksummary: { $in: taskToDelete } });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    const validUserCredentials = {
      email: "creator@mail.com",
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

  describe("POST /api/v1/boards/:boardId/tasks", () => {
    it("should create new task with a specified column Id", async () => {
      const board = await Board.findOne({
        boardname: "product list",
      });
      const column = await Column.findOne({
        columnname: "done",
      });
      const taskData = {
        tasksummary: "show price of the product",
        taskdescription: "has a feature to show the product price",
        status: column._id.toString(),
      };
      const boardId = board._id.toString();
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/tasks`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(taskData)
        .expect(201);
      expect(response.body).toHaveProperty("tasksummary", taskData.tasksummary);
      expect(response.body).toHaveProperty(
        "taskdescription",
        taskData.taskdescription,
      );
      expect(response.body).toHaveProperty("status", taskData.status);
    });

    it("should assigned a task to a valid member of board", async () => {
      const board = await Board.findOne({
        boardname: "product list",
      });
      const column = await Column.findOne({
        columnname: "done",
      });
      const newTaskData = {
        tasksummary: "show product quantity",
        taskdescription: "product should have a quantity",
        status: column._id.toString(),
        assignedto: "member@mail.com",
      };
      const boardId = board._id.toString();
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/tasks`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newTaskData)
        .expect(201);
      expect(response.body).toHaveProperty(
        "tasksummary",
        newTaskData.tasksummary,
      );
      expect(response.body).toHaveProperty(
        "taskdescription",
        newTaskData.taskdescription,
      );
      expect(response.body).toHaveProperty("status", newTaskData.status);
    });

    it("should not assigned a task to a non existing user", async () => {
      const board = await Board.findOne({
        boardname: "product list",
      });
      const column = await Column.findOne({
        columnname: "done",
      });
      const newTaskData = {
        tasksummary: "show product recommendations",
        taskdescription: "it should have product recommendation",
        status: column._id.toString(),
        assignedto: "invalidmember@mail.com",
      };
      const boardId = board._id.toString();
      const response = await request(app)
        .post(`/api/v1/boards/${boardId}/tasks`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newTaskData);
      expect(response.body.error).toHaveProperty("message", "user not found");
    });
  });

  describe("PUT /api/v1/boards/:boardId/tasks/:taskId", () => {
    it("should update all the fields", async () => {
      const board = await Board.findOne({
        boardname: "product list",
      });
      const boardId = board._id.toString();
      const newColumnData = {
        columnname: "review",
      };
      await request(app)
        .post(`/api/v1/boards/${boardId}/columns`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(newColumnData)
        .expect(201);
      const task = await Task.findOne({
        tasksummary: "show price of the product",
      });
      console.log(task);
      const column = await Column.findOne({ columnname: "review" });
      const columnId = column._id.toString();
      const updateTaskData = {
        tasksummary: "product price updated",
        taskdescription: "this product price is updated",
        status: columnId,
        assignedto: "member@mail.com",
      };
      const response = await request(app)
        .put(`/api/v1/boards/${boardId}/tasks/${task._id.toString()}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send(updateTaskData)
        .expect(200);
      expect(response.body).toHaveProperty(
        "tasksummary",
        updateTaskData.tasksummary,
      );
    });
  });

  describe("DELETE /api/v1/boards/:boardId/tasks/:taskId", () => {
    it("should delete a specific task", async () => {
      const board = await Board.findOne({
        boardname: "product list",
      });
      const task = await Task.findOne({
        tasksummary: "product price updated",
      });
      const response = await request(app)
        .delete(
          `/api/v1/boards/${board._id.toString()}/tasks/${task._id.toString()}`,
        )
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200);
      expect(response.body).toHaveProperty(
        "message",
        "deleted task successfully",
      );
    });
  });
});
