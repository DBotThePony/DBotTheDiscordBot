
/* global DBot, sql, Util, Postgres, hook */

let MembersTable = {};
let alreadyDefining = {};
let LoadingUser = {};

sql.MembersTable = MembersTable;
sql.alreadyDefining = alreadyDefining;
sql.LoadingUser = LoadingUser;

/*
 * GET FUNCTIONS
 */

DBot.GetUserID = function(obj) {
	let id = obj.id;
	
	if (!DBot.UsersIDs[id]) {
		DBot.DefineUser(obj);
		throw new Error('Initialize user first (' + (obj && obj.username || 'null') + ')');
	}
	
	obj.uid = DBot.UsersIDs[id];
	return DBot.UsersIDs[id];
};

DBot.GetChannelID = function(obj) {
	let id = obj.id;
	
	if (!DBot.ChannelIDs[id]) {
		DBot.DefineChannel(obj);
		throw new Error('Initialize channel first (' + (obj && obj.name || 'null') + ')');
	}
	
	obj.uid = DBot.ChannelIDs[id];
	return DBot.ChannelIDs[id];
};

DBot.GetServerID = function(obj) {
	let id = obj.id;
	
	if (!DBot.ServersIDs[id]) {
		DBot.DefineServer(obj);
		throw new Error('Initialize server first (' + (obj && obj.name || 'null') + ')');
	}
	
	obj.uid = DBot.ServersIDs[id];
	return DBot.ServersIDs[id];
};

DBot.GetMemberIDSoft = function(obj) {
	let id = obj.uid;
	
	if (!id) {
		if (!DBot.MemberIDs[obj.user.id] || !DBot.MemberIDs[obj.user.id][obj.guild.id]) {
			DBot.DefineMember(obj);
			return false;
		}
		
		obj.uid = DBot.MemberIDs[obj.user.id][obj.guild.id];
		return DBot.MemberIDs[obj.user.id][obj.guild.id];
	}
	
	return id;
};

DBot.GetUserIDSoft = function(obj) {
	let id = obj.id;
	
	if (!DBot.UsersIDs[id]) {
		DBot.DefineUser(obj);
		return false;
	}
	
	obj.uid = DBot.UsersIDs[id];
	return DBot.UsersIDs[id];
};

DBot.GetChannelIDSoft = function(obj) {
	let id = obj.id;
	
	if (!DBot.ChannelIDs[id]) {
		DBot.DefineChannel(obj);
		return false;
	}
	
	obj.uid = DBot.ChannelIDs[id];
	return DBot.ChannelIDs[id];
};

DBot.GetServerIDSoft = function(obj) {
	let id = obj.id;
	
	if (!DBot.ServersIDs[id]) {
		DBot.DefineServer(obj);
		return false;
	}
	
	return DBot.ServersIDs[id];
};

DBot.UserIsInitialized = function(obj) {
	return DBot.UsersIDs[obj.id] !== undefined;
};

DBot.ChannelIsInitialized = function(obj) {
	return DBot.ChannelIDs[obj.id] !== undefined;
};

DBot.ServerIsInitialized = function(obj) {
	return DBot.ServersIDs[obj.id] !== undefined;
};

DBot.GetUser = function(id) {
	if (!DBot.UsersIDs_R[id])
		return false;
	
	return DBot.UsersIDs_R[id];
};

DBot.GetChannel = function(id) {
	if (!DBot.ChannelIDs_R[id])
		return false;
	
	return DBot.ChannelIDs_R[id];
};

DBot.GetServer = function(id) {
	if (!DBot.ServersIDs_R[id])
		return false;
	
	return DBot.ServersIDs_R[id];
};

DBot.GetMember = function(ID) {
	return MembersTable[ID] || null;
};

DBot.GetMemberID = function(obj) {
	let id = obj.uid;
	
	if (!id) {
		if (!DBot.MemberIDs[obj.user.id] || !DBot.MemberIDs[obj.user.id][obj.guild.id]) {
			DBot.DefineMember(obj);
			throw new Error('Initialize member first (' + (obj && (obj.nickname || obj.user.username) || 'null') + ')');
		}
		
		obj.uid = DBot.MemberIDs[obj.user.id][obj.guild.id];
		return DBot.MemberIDs[obj.user.id][obj.guild.id];
	}
	
	return id;
};

/*
 * SETUP FUNCTIONS
 */

DBot.DefineServer = function(guild) {
	let id = guild.id;
	
	if (alreadyDefining[id])
		return;
	
	if (DBot.ServersIDs[id]) {
		guild.uid = DBot.ServersIDs[id];
		return;
	}
	
	alreadyDefining[id] = true;
	
	Postgres.query('SELECT ' + sql.Server(guild) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		
		alreadyDefining[id] = undefined;
		DBot.ServersIDs[id] = data[0].ID;
		DBot.ServersIDs_R[data[0].ID] = guild;
		guild.uid = data[0].ID;
		
		hook.Run('GuildInitialized', guild, data[0].ID, false);
		hook.Run('ServerInitialized', guild, data[0].ID, false);
		
		let channelCollection = new sql.ChannelSQLCollection();
		let rolesCollection = new sql.RoleSQLCollection();
		let usersCollection = new sql.UserSQLCollection();
		let membersCollection = new sql.MemberSQLCollection();
		
		for (const channel of guild.channels.values()) {
			channelCollection.push(channel);
		}
		
		for (const role of guild.roles.values()) {
			rolesCollection.push(role);
		}
		
		for (const member of guild.members.values()) {
			usersCollection.push(member.user);
			membersCollection.push(member);
		}
		
		channelCollection.updateMap();
		channelCollection.load(() => hook.Run('MultiChannelsInitialized', channelCollection));
		
		rolesCollection.updateMap();
		rolesCollection.load(() => hook.Run('MultiRolesInitialized', rolesCollection));
		
		usersCollection.updateMap();
		usersCollection.load(function() {
			hook.Run('MultiUsersInitialized', usersCollection);
			
			membersCollection.updateMap();
			membersCollection.load(() => {
				hook.Run('MultiMembersInitialized', membersCollection);
			});
		});
	});
};

DBot.DefineChannel = function(channel) {
	if (!DBot.IsReady()) return;
	
	let id = channel.id;
	
	if (DBot.ChannelIDs[id]) {
		channel.uid = DBot.ChannelIDs[id];
		return;
	}
	
	// PM
	if (!channel.guild)
		return;
	
	if (channel.type === 'dm') {
		console.trace('Tried to define channel ID when it is PM!');
		return;
	}
	
	let serverID = DBot.ServersIDs[channel.guild.id];
	
	if (!serverID)
		throw 'Server ID was never defined';
	
	Postgres.query('SELECT ' + sql.Channel(channel) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		DBot.ChannelIDs[id] = data[0].ID;
		DBot.ChannelIDs_R[data[0].ID] = channel;
		hook.Run('ChannelInitialized', channel, data[0].ID, false);
		channel.uid = data[0].ID;
	});
};

DBot.DefineRole = function(role, callback) {
	if (!DBot.IsReady()) return;
	
	Postgres.query('SELECT ' + sql.Role(role) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		role.uid = data[0].ID;
		sql.updateRole(role);
		hook.Run('RoleInitialized', role, role.uid, false);
		
		if (typeof callback === 'function')
			callback(role, data[0].ID);
	});
};

DBot.DefineUser = function(user) {
	if (!DBot.IsReady()) return;
	let id = user.id;

	if (LoadingUser[id])
		return;

	if (DBot.UsersIDs[id]) {
		user.uid = DBot.UsersIDs[id];
		return;
	}

	LoadingUser[id] = true;

	Postgres.query('SELECT ' + sql.User(user) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		DBot.UsersIDs[id] = data[0].ID;
		DBot.UsersIDs_R[data[0].ID] = user;
		LoadingUser[id] = undefined;
		user.uid = data[0].ID;
		hook.Run('UserInitialized', user, data[0].ID, false);
		hook.Run('ClientInitialized', user, data[0].ID, false);
	});
};

DBot.DefineMember = function(obj) {
	if (!DBot.IsReady()) return;
	if (obj.uid) return;
	
	if (DBot.MemberIDs[obj.user.id] && DBot.MemberIDs[obj.user.id][obj.guild.id]) {
		obj.uid = DBot.MemberIDs[obj.user.id][obj.guild.id];
		return;
	}
	
	Postgres.query('SELECT ' + sql.Member(obj) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		obj.uid = data[0].ID;
		hook.Run('MemberInitialized', obj, obj.uid, false);
		
		MembersTable[obj.uid] = obj;
	});
};

/*
 * UPDATE FUNCTIONS
 */

sql.updateRole = function(role) {
	let perms = role.serialize();
	let arr = [];
	
	for (let name in perms) {
		if (perms[name])
			arr.push(name);
	}
	
	let arr2 = sql.Array(arr) + '::discord_permission[]';
	
	let col = Util.parseHexColor(role.hexColor);
	let colStr = '(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
	
	Postgres.query('UPDATE roles SET "NAME" = ' + Postgres.escape(role.name) + ', "PERMS" = ' + arr2 + ', "COLOR_R" = ' + colStr + ', "HOIST" = ' + Postgres.escape(role.hoist) + ', "POSITION" = ' + Postgres.escape(role.position) + ', "MENTION" = ' + Postgres.escape(role.mentionable) + ' WHERE "ID" = ' + role.uid + ';');
};

sql.updateRoles = function(roles) {
	let rolesDup = {};
	
	let finalQuery = '';
	
	for (let role of roles) {
		if (rolesDup[role.uid])
			return;
		
		rolesDup[role.uid] = true;
		
		let perms = role.serialize();
		let arr = [];
		
		for (let name in perms) {
			if (perms[name])
				arr.push(name);
		}
		
		let arr2 = sql.Array(arr) + '::discord_permission[]';
		
		let col = Util.parseHexColor(role.hexColor);
		let colStr = '(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
		
		if (finalQuery)
			finalQuery += ',';
		else
			finalQuery = '';
		
		finalQuery += '(' + role.uid + ',' + Postgres.escape(role.name) + ',' + colStr + '::rgb_color,' + Postgres.escape(role.hoist) + ',' + Postgres.escape(role.position) + ',' + Postgres.escape(role.mentionable) + ',' + arr2 + ')';
	}
	
	Postgres.query('UPDATE roles SET "NAME" = m."NAME", "PERMS" = m."PERMS", "COLOR_R" = m."COLOR_R", "HOIST" = m."HOIST", "POSITION" = m."POSITION", "MENTION" = m."MENTION" FROM (VALUES ' + finalQuery + ') AS m ("ID", "NAME", "COLOR_R", "HOIST", "POSITION", "MENTION", "PERMS") WHERE roles."ID" = m."ID";');
};

sql.updateLastSeenFunc = function(callback, force) {
	if (!DBot.SQLReady() && !force) return;
	let build = [];
	
	for (let uid in DBot.UsersIDs_R)
		build.push(uid);
	
	let buildServers = [];
	let buildChannels = [];
	let buildMembers = [];
	
	for (let server of DBot.GetServers()) {
		let uid = DBot.GetServerIDSoft(server);
		
		if (!uid) continue;
		
		buildServers.push(uid);
		
		for (let channel of server.channels.array()) {
			let uid = DBot.GetChannelIDSoft(channel);
			if (!uid) continue;
			buildChannels.push(uid);
		}
		
		for (let member of server.members.array()) {
			let uid = DBot.GetMemberIDSoft(member);
			if (!uid) continue;
			buildMembers.push(uid);
		}
	}
	
	let cTime = Math.floor(CurTime());
	
	let finalQuery = 'UPDATE users SET "TIME" = ' + cTime + ' WHERE "ID" IN (' + build.join(',') + ');';
	
	if (buildServers)
		finalQuery += 'UPDATE servers SET "TIME" = ' + cTime + ' WHERE "ID" IN (' + buildServers.join(',') + ');';
	
	if (buildChannels)
		finalQuery += 'UPDATE channels SET "TIME" = ' + cTime + ' WHERE "ID" IN (' + buildChannels.join(',') + ');';
	
	if (buildMembers)
		finalQuery += 'UPDATE members SET "TIME" = ' + cTime + ' WHERE "ID" IN (' + buildMembers.join(',') + ');';
	
	Postgres.query(finalQuery, callback);
};