const TeamMembersService = {
  getAll(knex) {
    return knex
      .select('*')
      .from('team_members')
      .orderBy('first_name', 'asc')
  },
  getById(knex, id) {
    return knex
      .select('*')
      .from('team_members')
      .where('team_member_id', id)
      .first()
  },
  updateTeamMember(knex, id, updateTeamMemberFields) {
    return knex('team_members')
      .where({ team_member_id: id })
      .update(updateTeamMemberFields)
  },
  insertTeamMember(knex, newTeamMember) {
    return knex
      .insert(newTeamMember)
      .into('team_members')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
};

module.exports = TeamMembersService;