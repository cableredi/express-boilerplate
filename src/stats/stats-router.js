const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const StatsService = require("./stats-service");
const { requireAuth } = require("../middleware/jwt-auth");
const TeamMembersService = require("../team-members/team-members-service");

const statsRouter = express.Router();
const jsonParser = express.json();

const serializeStatsMember = (stat) => ({
  stat_id: stat.stat_id,
  stat_date: stat.stat_date,
  team_member_id: stat.team_member_id,
  first_name: xss(stat.first_name),
  last_name: xss(stat.last_name),
  stat_type: xss(stat.stat_type),
  total: xss(stat.total),
  percent: xss(stat.percent),
  inf: xss(stat.inf),
});

statsRouter
  .route("/all")

  .get((req, res, next) => {
    StatsService.getAll(req.app.get("db"))
      .then((stats) => {
        res.json(stats);
      })
      .catch(next);
  });

statsRouter
  .route("/date")

  .get((req, res, next) => {
    StatsService.getMaxDate(req.app.get("db"))
      .then((stats) => {
        res.json(stats.rows[0]);
      })
      .catch(next);
  });

statsRouter
  .route("/")

  .post(jsonParser, (req, res, next) => {
    const {
      team_member_id,
      stat_type,
      stat_date,
      total,
      percent,
      inf,
    } = req.body;

    const newStats = {
      team_member_id,
      stat_type,
      stat_date,
      total,
      percent,
      inf,
    };

    const numberOfValues = Object.values(newStats).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.sendStatus(400).json({
        error: {
          message: `Request body must contain all data`,
        },
      });
    }

    StatsService.insertStat(req.app.get("db"), newStats)
      .then((stats) => {
        logger.info(`Statistics with id ${stats.stat_id} created.`);

        return TeamMembersService.getById(
          req.app.get("db"),
          stats.team_member_id
        )
          .then((member) => {
            stats.first_name = member.first_name;
            stats.last_name = member.last_name;

            res.json(serializeStatsMember(stats));
          })
          .catch(next);
      })
      .catch(next);
  });

module.exports = statsRouter;