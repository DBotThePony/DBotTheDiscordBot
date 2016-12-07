
const moment = require('moment');
const utf8 = require('utf8');
const hDuration = require('humanize-duration');

let updating = {};

let updateRoleRules = function(role) {
	let members = role.members.array();
	
	if (updating[role.uid])
		return;
	
	updating[role.uid] = true;
	
	MySQL.query('SELECT `MEMBER`, restore_member(`member_roles`.`MEMBER`) as `USER` FROM `member_roles` WHERE `ROLE` = get_role_id_combined("' + role.id + '", "' + role.guild.id + '")', function(err, data) {
		updating[role.uid] = undefined;
		if (err) throw err;
		data = data || {};
		
		for (let member of members) {
			let hit = false;
			
			for (let row of data) {
				if (row.USER == member.id) {
					hit = true;
					break;
				}
			}
			
			if (!hit) {
				MySQL.query('INSERT INTO `roles_log` (`MEMBER`, `ROLE`, `TYPE`) VALUES (get_member_id("' + member.id + '", "' + role.guild.id + '"), get_role_id_combined("' + role.id + '", "' + role.guild.id + '"), 1)');
				MySQL.query('REPLACE INTO `member_roles` VALUES(get_member_id("' + member.id + '", "' + role.guild.id + '"), get_role_id_combined("' + role.id + '", "' + role.guild.id + '"))');
			}
		}
		
		for (let row of data) {
			let hit = false;
			
			for (let member of members) {
				if (row.USER == member.id) {
					hit = true;
					break;
				}
			}
			
			if (!hit) {
				MySQL.query('INSERT INTO `roles_log` (`MEMBER`, `ROLE`, `TYPE`) VALUES ("' + row.MEMBER + '", get_role_id_combined("' + role.id + '", "' + role.guild.id + '"), 0)');
				MySQL.query('DELETE FROM `member_roles` WHERE `MEMBER` = "' + row.MEMBER + '" AND `ROLE` = get_role_id_combined("' + role.id + '", "' + role.guild.id + '")');
			}
		}
	});
}

hook.Add('RoleInitialized', 'Default', updateRoleRules);

hook.Add('MemberChanges', 'Default', function(oldM, newM) {
	for (let role of oldM.roles.array()) {
		updateRoleRules(role);
	}
	
	for (let role of newM.roles.array()) {
		updateRoleRules(role);
	}
});
