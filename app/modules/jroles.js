
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

cvars.ServerVar('join_role', '', [FCVAR_ROLE], 'A Role to assign for new users');
cvars.ServerVar('join_role_enable', '0', [FCVAR_BOOL], 'Enable assign of role for new users');

hook.Add('SoftbanJoinPass', 'JoinRoles', function(user, server, member) {
	if (!DBot.ServerIsInitialized(server))
		return;
	
	if (!cvars.Server(server).getVar('join_role_enable').getBool())
		return;
	
	let role = cvars.Server(server).getVar('join_role').getRole();
	if (!role)
		return;
	
	let me = server.member(DBot.bot.user);
	
	if (!me || !me.hasPermission('MANAGE_ROLES_OR_PERMISSIONS'))
		return;
	
	member.addRole(role);
});
