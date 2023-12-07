require("dotenv").config();

const config = {
  port: process.env.DEV_PORT,
  database: {
    username: "keandev",
    password: "8uee0nnhm21dw",
    databasename: "taskhubdevdb",
  },
};

console.log("running in development environment");

module.exports = config;
