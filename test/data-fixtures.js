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


function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.user_id }, secret, {
    subject: user.user_name,
    algorithm: "HS256",
  });

  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeAuthHeader,
};
