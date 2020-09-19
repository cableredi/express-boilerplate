const knex = require('knex');
const fixtures = require('./fulfillment-fixtures');
const app = require('../src/app');

describe('Team Members Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
    db.raw('TRUNCATE users, team_members RESTART IDENTITY CASCADE')
  });

  afterEach('cleanup', () => db.raw('TRUNCATE users, team_members RESTART IDENTITY CASCADE'));

  after('disconnect from db', () => db.destroy())

  describe('GET /api/teammembers', () => {
    const testUsers = fixtures.makeUsersArray();

    beforeEach('insert users', () => {
      return db
        .into('users')
        .insert(testUsers)
    })

    context(`Given no team members`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/teammembers')
          .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })

    context('Given there are team members in the database', () => {
      const testTeamMembers = fixtures.makeTeamMembersArray();

      beforeEach('insert team members', () => {
        return db
          .into('team_members')
          .insert(testTeamMembers)
      })

      it('gets the team members from database', () => {
        return supertest(app)
          .get('/api/teammembers')
          .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            for (let i = 0; i < testTeamMembers.length; i++) {
              expect(res.body[i].first_name).to.eql(testTeamMembers[i].first_name)
              expect(res.body[i].last_name).to.eql(testTeamMembers[i].last_name)
              expect(res.body[i].expected_result).to.eql(testTeamMembers[i].expected_result)
              expect(res.body[i].actual_result).to.eql(testTeamMembers[i].actual_result)
              expect(res.body[i]).to.have.property('team_member_id')
            }
          })
      })
    })
  })

  describe(`POST /api/teammembers`, () => {
    const testUsers = fixtures.makeUsersArray();

    beforeEach('insert users', () => {
      return db
        .into('users')
        .insert(testUsers)
    })

    it(`creates a team member, responding with 201 and the new team member`, function () {
      this.retries(3)
      const newTeamMember = {
        "team_member_id": 1,
        "first_name": "Mary",
        "last_name": "Smith",
      }
      return supertest(app)
        .post('/api/teammembers')
        .send(newTeamMember)
        .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
        .expect(201)
        .expect(res => {
          expect(res.body.expected_result).to.eql(newTeamMember.expected_result)
          expect(res.body.actual_result).to.eql(newTeamMember.actual_result)
          expect(res.body.first_name).to.eql(newTeamMember.first_name)
          expect(res.body.last_name).to.eql(newTeamMember.last_name)
          expect(res.body).to.have.property('team_member_id')
          expect(res.headers.location).to.eql(`/api/teammembers/${res.body.team_member_id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/teammembers/${res.body.team_member_id}`)
            .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
            .expect(res.body)
        )
    });
  });

  describe('GET /api/teammembers/:team_member_id', () => {
    const testUsers = fixtures.makeUsersArray();
    const testTeamMembers = fixtures.makeTeamMembersArray();

    beforeEach('insert users', () => {
      return db
        .into('users')
        .insert(testUsers)
    })

    beforeEach('insert team members', () => {
      return db
        .into('team_members')
        .insert(testTeamMembers)
    })

    it('responds with 200 and the specified team member', () => {
      const team_member_id = 2;
      const expectedTeamMember = fixtures.makeExpectedTeamMember();

      return supertest(app)
        .get(`/api/teammembers/${team_member_id}`)
        .set('Authorization', fixtures.makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect(res => {
          expect(res.body.expected_result).to.eql(expectedTeamMember.expected_result)
          expect(res.body.actual_result).to.eql(expectedTeamMember.actual_result)
          expect(res.body.first_name).to.eql(expectedTeamMember.first_name)
          expect(res.body.last_name).to.eql(expectedTeamMember.last_name)
          expect(res.body).to.have.property('team_member_id')
        })
    })
  })
});