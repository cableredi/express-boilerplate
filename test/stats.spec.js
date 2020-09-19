const knex = require("knex");
const fixtures = require("./fulfillment-fixtures");
const app = require("../src/app");

describe("Fulfillment Endpoints", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
    db.raw("TRUNCATE users, team_members, stats RESTART IDENTITY CASCADE");
  });

  afterEach("cleanup", () =>
    db.raw("TRUNCATE users, team_members, stats RESTART IDENTITY CASCADE")
  );

  after("disconnect from db", () => db.destroy());

  describe("GET /api/stats/all", () => {
    const testUsers = fixtures.makeUsersArray();
    const testTeamMembers = fixtures.makeTeamMembersArray();

    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });

    beforeEach("insert team_members", () => {
      return db.into("team_members").insert(testTeamMembers);
    });

    context(`Given no stats`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/stats/all")
          .set("Authorization", fixtures.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });

    context("Given there are stats in the database", () => {
      const testStats = fixtures.makeStatsArray();

      beforeEach("insert stats", () => {
        return db.into("stats").insert(testStats);
      });

      it("gets the stats from database", () => {
        return supertest(app)
          .get("/api/stats/all")
          .set("Authorization", fixtures.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect((res) => {
            for (let i = 0; i < testStats.length; i++) {
              expect(res.body[i].stat_id).to.eql(testStats[i].stat_id);
              expect(res.body[i].team_member_id).to.eql(
                testStats[i].team_member_id
              );
              expect(res.body[i].stat_type).to.eql(testStats[i].stat_type);
              expect(res.body[i].stat_date.substring(0, 9)).to.eql(
                testStats[i].stat_date.substring(0, 9)
              );
              expect(Number(res.body[i].total)).to.eql(testStats[i].total);
              expect(Number(res.body[i].percent)).to.eql(testStats[i].percent);
              expect(Number(res.body[i].inf)).to.eql(testStats[i].inf);
              expect(res.body[i].expected_result).to.eql(
                testStats[i].expected_result
              );
              expect(res.body[i].actual_result).to.eql(
                testStats[i].actual_result
              );
              expect(res.body[i]).to.have.property("stat_id");
            }
          });
      });
    });
  });

  describe(`POST /api/stats`, () => {
    const testUsers = fixtures.makeUsersArray();
    const testTeamMembers = fixtures.makeTeamMembersArray();

    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });

    beforeEach("insert team_members", () => {
      return db.into("team_members").insert(testTeamMembers);
    });

    it(`creates a stat, responding with 201 and the new stat`, function () {
      this.retries(3);
      
      const newStat = {
        team_member_id: 1,
        stat_type: "pack",
        stat_date: "2020-02-09",
        total: 300,
        percent: 45.2,
        inf: 0,
      };
      
      const expectedReturn = {
        team_member_id: 1,
        first_name: 'Test1',
        last_name: 'User1',
        stat_type: "pack",
        stat_date: "2020-02-09",
        total: 300,
        percent: 45.2,
        inf: 0,
      }

      return supertest(app)
        .post("/api/stats")
        .send(newStat)
        .set("Authorization", fixtures.makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect((res) => {
          expect(res.body.stat_date.substring(0, 9)).to.eql(
            expectedReturn.stat_date.substring(0, 9)
          );
          expect(res.body.expected_result).to.eql(expectedReturn.expected_result);
          expect(res.body.actual_result).to.eql(expectedReturn.actual_result);
          expect(res.body.stat_type).to.eql(expectedReturn.stat_type);
          expect(res.body.team_member_id).to.eql(expectedReturn.team_member_id);
          expect(res.body.last_name).to.eql(expectedReturn.last_name);
          expect(res.body.first_name).to.eql(expectedReturn.first_name);
          expect(Number(res.body.total)).to.eql(expectedReturn.total);
          expect(Number(res.body.percent)).to.eql(expectedReturn.percent);
          expect(Number(res.body.inf)).to.eql(expectedReturn.inf);
          expect(res.body).to.have.property("stat_id");
          //expect(res.headers.location).to.eql(`/api/stats/${res.body.stat_id}`)
        })
    });
  });

  describe("GET /api/stats/date", () => {
    const testUsers = fixtures.makeUsersArray();
    const testTeamMembers = fixtures.makeTeamMembersArray();
    const testStats = fixtures.makeStatsArray();

    beforeEach("insert users", () => {
      return db.into("users").insert(testUsers);
    });

    beforeEach("insert team_members", () => {
      return db.into("team_members").insert(testTeamMembers);
    });

    beforeEach("insert stats", () => {
      return db.into("stats").insert(testStats);
    });

    it("responds with 200 and the maximum date entered", () => {
      const stat_id = 2;
      const expectedMaxDateStat = fixtures.makeExpectedMaxDateStat();

      return supertest(app)
        .get(`/api/stats/date`)
        .set("Authorization", fixtures.makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect((res) => {
          console.log('kim res.body', res.body)

          expect(res.body.max_date.substring(0, 9)).to.eql(
            expectedMaxDateStat.max_date.substring(0, 9)
          );
          expect(res.body.expected_result).to.eql(expectedMaxDateStat.expected_result);
          expect(res.body.actual_result).to.eql(expectedMaxDateStat.actual_result);
        });
    });
  });
});
