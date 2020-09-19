require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const errorHandler = require("./error-handler");
const statsRouter = require("./stats/stats-router");
const authRouter = require("./auth/auth-router");
const usersRouter = require("./users/users-router");
const teamMembersRouter = require("./team-members/team-members-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "dev";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use("/api/stats", statsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/teammembers", teamMembersRouter);

app.get("/", (req, res) => {
  res.json({ ok: true });
});

/* Error handling */
app.use(errorHandler);

module.exports = app;
