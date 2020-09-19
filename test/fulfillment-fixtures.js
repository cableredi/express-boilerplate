const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      user_id: 1,
      user_name: 'test-user-1',
      first_name: 'user first 1',
      last_name: 'user last 1',
      password: '$2a$12$YslIk77V5HvK2BG4Rzw57OMm1sTx0ssMCURA6njiYO.SohOgAAc7y',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      user_id: 2,
      user_name: 'test-user-2',
      first_name: 'user first 2',
      last_name: 'user last 2',
      password: '$2a$12$YslIk77V5HvK2BG4Rzw57OMm1sTx0ssMCURA6njiYO.SohOgAAc7y',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}

function makeTeamMembersArray() {
  return [
    {
      team_member_id: 1,
      first_name: "Test1",
      last_name: "User1",
    },
    {
      team_member_id: 2,
      first_name: "Test2",
      last_name: "User2",
    },
  ];
}

function makeExpectedTeamMember() {
  return {
    team_member_id: 2,
    first_name: "Test2",
    last_name: "User2",
  };
}

function makeStatsArray() {
  return [
    {
      stat_id: 1,
      team_member_id: 1,
      stat_type: "pack",
      stat_date: "2020-02-08",
      total: 300,
      percent: 45.2,
      inf: 0,
    },
    {
      stat_id: 2,
      team_member_id: 2,
      stat_type: "pick",
      stat_date: "2020-02-08",
      total: 300,
      percent: 45.2,
      inf: 2.3,
    },
    {
      stat_id: 3,
      team_member_id: 2,
      stat_type: "opu",
      stat_date: "2020-02-08",
      total: 300,
      percent: 45.2,
      inf: 2.3,
    },
  ];
}

function makeExpectedStats() {
  return [
    {
      stat_id: 2,
      team_member_id: 2,
      stat_type: "pick",
      stat_date: "2020-02-08",
      total: 300,
      percent: 45.2,
      inf: 2.3,
    },
    {
      stat_id: 3,
      team_member_id: 2,
      stat_type: "opu",
      stat_date: "2020-02-08",
      total: 300,
      percent: 45.2,
      inf: 2.3,
    },
  ];
}

function makeExpectedMaxDateStat() {
  return {
    max_date: "2020-02-08",
  };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.user_id }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });

  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeTeamMembersArray,
  makeExpectedTeamMember,
  makeStatsArray,
  makeExpectedStats,
  makeAuthHeader,
  makeExpectedMaxDateStat,
};
