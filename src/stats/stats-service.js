const StatsService = {
  getAll(knex, startDate, endDate) {
    return knex
      .select("*")
      .from("stats")
      .join(
        "team_members",
        "team_members.team_member_id",
        "stats.team_member_id"
      )
      .where("stats", "stat_date", statDate);
  },
  getMaxDate(knex) {
    return knex.raw(`
      SELECT MAX(stat_date) as max_date
      FROM stats
    `);
  },
  getAll(knex) {
    return knex
      .select("*")
      .from("stats")
      .join(
        "team_members",
        "team_members.team_member_id",
        "stats.team_member_id"
      )
      .orderBy("stat_date", "asc", "stats.stat_type", "asc");
  },
  getByTeamMemberId(knex, id) {
    return knex.select("*").from("stats").where("stats", "team_member_id", id);
  },
  insertStat(knex, stat) {
    return knex
      .insert(stat)
      .into("stats")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = StatsService;