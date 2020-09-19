const path = require("path");
const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const TeamMembersService = require("./team-members-service");
const { requireAuth } = require("../middleware/jwt-auth");

const teamMembersRouter = express.Router();
const jsonParser = express.json();

const serializeTeamMembers = (member) => ({
  team_member_id: member.team_member_id,
  first_name: xss(member.first_name),
  last_name: xss(member.last_name),
});

teamMembersRouter
  .route("/")
  .all(requireAuth)

  .get((req, res, next) => {
    TeamMembersService.getAll(req.app.get("db"))
      .then((teamMembers) => {
        res.json(teamMembers.map(serializeTeamMembers));
      })
      .catch(next);
  })

  .post(jsonParser, (req, res, next) => {
    const { first_name, last_name } = req.body;

    const newTeamMember = {
      first_name,
      last_name,
    };

    const numberOfValues = Object.values(newTeamMember).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.sendStatus(400).json({
        error: {
          message: `Request body must contain a first and last name`,
        },
      });
    }

    TeamMembersService.insertTeamMember(req.app.get("db"), newTeamMember)
      .then((teamMember) => {
        logger.info(
          `Team member with id ${teamMember.team_member_id} created.`
        );
        res
          .status(201)
          .location(
            path.posix.join(req.originalUrl, `/${teamMember.team_member_id}`)
          )
          .json(serializeTeamMembers(teamMember));
      })
      .catch(next);
  });

teamMembersRouter
.route('/:team_member_id')

.all((req, res, next) => {
  TeamMembersService.getById(
    req.app.get('db'),
    req.params.team_member_id
  )
    .then(teamMember => {
      if (!teamMember) {
        return res.status(404).json({
          error: { message: 'Team member Not Found' }
        })
      }
      res.teamMember = teamMember
      next()
    })
    .catch()
})

.get((req, res) => {
  res.json(serializeTeamMembers(res.teamMember))
})

// .patch(jsonParser, (req, res, next) => {
//   const {
//     first_name, last_name
//   } = req.body

//   const teamMemberToUpdate = {
//     first_name, last_name
//   };

//   const numberOfValues = Object.values(bugToUpdate).filter(Boolean).length
//   if (numberOfValues === 0) {
//     return res.sendStatus(400).json({
//       error: {
//         message: `Request body must contain first and last name`
//       }
//     })
//   }

//   if (error) return res.sendStatus(400).send(error);

//   serializeTeamMembers.teamMemberToUpdate(
//     req.app.get('db'),
//     req.params.team_member_id,
//     teamMemberToUpdate
//   )
//     .then(numRowsAffected => {
//       res.sendStatus(204)
//     })
//     .catch(next)

// })

module.exports = teamMembersRouter;