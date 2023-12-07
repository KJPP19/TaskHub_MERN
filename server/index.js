const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const boardRoutes = require("./src/routes/boardRoute");
const userRoutes = require("./src/routes/userRoute");
const memberRoutes = require("./src/routes/memberRoute");
const columnRoutes = require("./src/routes/columnRoute");
const taskRoutes = require("./src/routes/taskRoute");
const { errorHandler } = require("./src/middleware/globalerrorhandler");

app.use(cors());
app.use(express.json());

app.use("/api/v1", userRoutes);
app.use("/api/v1/boards", boardRoutes);
app.use("/api/v1", memberRoutes);
app.use("/api/v1", columnRoutes);
app.use("/api/v1", taskRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    const env = process.env.NODE_ENV || "development";
    if (env === "test") {
      console.log("running on test environment for integration testing");
      return;
    }
    const config = require(`../server/src/config/${env}.conf`);
    await mongoose.connect(
      `mongodb+srv://${config.database.username}:${config.database.password}@${config.database.databasename}.6id11wa.mongodb.net/?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
    console.log("connected to MongoDB");
    app.listen(config.port, () => {
      console.log(`server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("failed to connect to MongoDB", error);
  }
};

startServer();

module.exports = app;
