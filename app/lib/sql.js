
const fs = require('fs');
const pg = require('pg');

const pgConfig = {
	user: DBot.cfg.sql_user,
	database: DBot.cfg.sql_database,
	password: DBot.cfg.sql_password,
	host: DBot.cfg.sql_hostname,
	port: DBot.cfg.sql_port,
}

let pgConnection = new pg.Client(pgConfig);

MySQL = pgConnection;
MySQLM = pgConnection;

DBot.MySQL = MySQL;
DBot.MySQLM = MySQLM;

PG = pgConnection;
Postgre = pgConnection;
Postgres = pgConnection;
DBot.PG = pgConnection;
DBot.Postgre = pgConnection;
DBot.Postgres = pgConnection;

let sqlPg = fs.readFileSync('./app/postgres.sql', 'utf8').replace(/\r/gi, '');

pgConnection.oldQuery = pgConnection.query;

pgConnection.query = function(query, callback) {
	let oldStack = new Error().stack;
	
	pgConnection.oldQuery(query, function(err, data) {
		let newErrorMessage;
		
		if (err) {
			newErrorMessage = 'QUERY: ' + (err.internalQuery || query) + '\nERROR: ' + err.message;
			
			if (err.hint)
				newErrorMessage += '\nHINT: ' + err.hint;
			
			if (err.detail)
				newErrorMessage += '\n' + err.hint;
			
			newErrorMessage += '\n' + oldStack;
			err.stack = newErrorMessage;
			
			if (!callback) throw err;
		}
		
		if (callback) {
			try {
				let obj = {};
				let cID = 0;
				let amountOfRows = 0;
				
				if (data) {
					amountOfRows = data.rows.length;
					
					for (let row of data.rows) {
						obj[cID] = row;
						cID++;
						
						for (let i in row) {
							if (typeof i == 'string') {
								row[i.toUpperCase()] = row[i];
								row[i.toLowerCase()] = row[i];
							}
						}
					}
				}
				
				obj[Symbol.iterator] = function* () {
					for (let i = 0; i < amountOfRows; i++) {
						yield data.rows[i];
					}
				}
				
				callback(err, obj, data);
			} catch(newErr) {
				let e = new Error(newErr);
				e.stack = newErr.stack + '\n ------- \n' + oldStack.substr(6);
				throw e; // Rethrow
			}
		}
	});
}

pgConnection.connect(function(err) {
	if (err)
		throw err;
	
	pgConnection.query(sqlPg, function(err) {
		if (err)
			throw err;
		
		hook.Run('SQLInitialize');
	});
});

DBot.ChannelIDs = {};
DBot.ServersIDs = {};
DBot.UsersIDs = {};
DBot.MemberIDs = {};

DBot.ChannelIDs_R = {};
DBot.ServersIDs_R = {};
DBot.UsersIDs_R = {};
DBot.MemberIDs_R = {};

hook.Add('ValidClientLeftServer', 'MySQL.Handlers', function(user, server) {
	let id = user.id;
	if (!DBot.UserIsGarbage(id))
		return;
	
	hook.Run('PreDeleteUser', user);
	DBot.UsersIDs_R[DBot.UsersIDs[id]] = undefined;
	DBot.UsersIDs[id] = undefined;
	hook.Run('PostDeleteUser', user);
});

hook.Add('OnJoinedServer', 'MySQL.Handlers', function(server) {
	DBot.DefineGuild(server);
});

hook.Add('ChannelCreated', 'MySQL.Handlers', function(channel) {
	if (!channel.guild)
		return;
	
	if (channel.type == 'dm')
		return;
	
	// Channel in a new server
	if (!DBot.ServersIDs[channel.guild.id])
		return;
	
	DBot.DefineChannel(channel);
});

hook.Add('ValidClientJoinsServer', 'MySQL.Handlers', function(user, server, member) {
	DBot.DefineUser(user);
	DBot.DefineMember(member);
});

hook.Add('ValidClientAvaliable', 'MySQL.Handlers', function(user, server, member) {
	DBot.DefineUser(user);
	DBot.DefineMember(member);
});

let ChannelDeleted = function(channel) {
	hook.Run('PreDeleteChannel', channel);
	DBot.ChannelIDs_R[DBot.ChannelIDs[channel.id]] = undefined;
	DBot.ChannelIDs[channel.id] = undefined;
	hook.Run('PostDeleteChannel', channel);
}

hook.Add('ChannelDeleted', 'MySQL.Handlers', ChannelDeleted);

hook.Add('OnLeftServer', 'MySQL.Handlers', function(server) {
	server.channels.array().forEach(ChannelDeleted);
	
	hook.Run('PreDeleteServer', server);
	DBot.ServersIDs_R[DBot.ServersIDs[server.id]] = undefined;
	DBot.ServersIDs[server.id] = undefined;
	hook.Run('PostDeleteServer', server);
});

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
}

DBot.GetUserID = function(obj) {
	let id = obj.id;
	
	if (!DBot.UsersIDs[id]) {
		DBot.DefineUser(obj);
		throw new Error('Initialize user first (' + (obj && obj.username || 'null') + ')');
	}
	
	obj.uid = DBot.UsersIDs[id];
	return DBot.UsersIDs[id];
}

DBot.GetChannelID = function(obj) {
	let id = obj.id;
	
	if (!DBot.ChannelIDs[id]) {
		DBot.DefineChannel(obj);
		throw new Error('Initialize channel first (' + (obj && obj.name || 'null') + ')');
	}
	
	obj.uid = DBot.ChannelIDs[id];
	return DBot.ChannelIDs[id];
}

DBot.GetServerID = function(obj) {
	let id = obj.id;
	
	if (!DBot.ServersIDs[id]) {
		DBot.DefineServer(obj);
		throw new Error('Initialize server first (' + (obj && obj.name || 'null') + ')');
	}
	
	obj.uid = DBot.ServersIDs[id];
	return DBot.ServersIDs[id];
}

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
}

DBot.GetUserIDSoft = function(obj) {
	let id = obj.id;
	
	if (!DBot.UsersIDs[id]) {
		DBot.DefineUser(obj);
		return false;
	}
	
	obj.uid = DBot.UsersIDs[id];
	return DBot.UsersIDs[id];
}

DBot.GetChannelIDSoft = function(obj) {
	let id = obj.id;
	
	if (!DBot.ChannelIDs[id]) {
		DBot.DefineChannel(obj);
		return false;
	}
	
	obj.uid = DBot.ChannelIDs[id];
	return DBot.ChannelIDs[id];
}

DBot.GetServerIDSoft = function(obj) {
	let id = obj.id;
	
	if (!DBot.ServersIDs[id]) {
		DBot.DefineServer(obj);
		return false;
	}
	
	return DBot.ServersIDs[id];
}

DBot.UserIsInitialized = function(obj) {
	return DBot.UsersIDs[obj.id] != undefined;
}

DBot.ChannelIsInitialized = function(obj) {
	return DBot.ChannelIDs[obj.id] != undefined;
}

DBot.ServerIsInitialized = function(obj) {
	return DBot.ServersIDs[obj.id] != undefined;
}

hook.Add('CheckValidMessage', 'MySQL.Checker', function(msg) {
	if (!DBot.IsReady()) return true;
	if (!DBot.UserIsInitialized(msg.author)) {
		DBot.DefineUser(msg.author);
		return true;
	}
	
	if (!DBot.IsPM(msg)) {
		if (!DBot.ServerIsInitialized(msg.channel.guild)) {
			DBot.DefineServer(msg.channel.guild);
			return true;
		} else if (!DBot.ChannelIsInitialized(msg.channel)) {
			DBot.DefineChannel(msg.channel);
			return true;
		} else if (!msg.member) { // wtf
			msg.channel.guild.fetchMembers();
			console.error('Unexpected, server ' + msg.channel.guild.name + ' have null member!');
			return true;
		} else if (!msg.member.uid) {
			DBot.DefineMember(msg.member);
			return true;
		}
	}
});

DBot.GetUser = function(id) {
	if (!DBot.UsersIDs_R[id])
		return false;
	
	return DBot.UsersIDs_R[id];
}

DBot.GetChannel = function(id) {
	if (!DBot.ChannelIDs_R[id])
		return false;
	
	return DBot.ChannelIDs_R[id];
}

DBot.GetServer = function(id) {
	if (!DBot.ServersIDs_R[id])
		return false;
	
	return DBot.ServersIDs_R[id];
}

let LoadingUser = {};

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
	
	MySQL.query('SELECT ' + sql.User(user) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		DBot.UsersIDs[id] = data[0].ID;
		DBot.UsersIDs_R[data[0].ID] = user;
		LoadingUser[id] = undefined;
		user.uid = data[0].ID;
		hook.Run('UserInitialized', user, data[0].ID);
		hook.Run('ClientInitialized', user, data[0].ID);
		Postgre.query('INSERT INTO last_seen VALUES (' + data[0].ID + ', ' + Math.floor(CurTime()) + ') ON CONFLICT ("ID") DO UPDATE SET "TIME" = ' + Math.floor(CurTime()));
	});
}

let updateLastSeenFunc = function(callback) {
	let build = [];
	
	for (let uid in DBot.UsersIDs_R)
		build.push(uid);
	
	let buildServers = [];
	let buildChannels = [];
	
	for (let server of DBot.GetServers()) {
		let uid = DBot.GetServerIDSoft(server);
		
		if (!uid)
			continue;
		
		buildServers.push(uid);
		
		for (let channel of server.channels.array()) {
			let uid = DBot.GetChannelIDSoft(channel);
			
			if (!uid)
				continue;
			
			buildChannels.push(uid);
		}
	}
	
	let cTime = Math.floor(CurTime());
	
	Postgre.query('UPDATE last_seen SET "TIME" = ' + cTime + ' WHERE "ID" IN (' + build.join(',') + ');UPDATE last_seen_servers SET "TIME" = ' + cTime + ' WHERE "ID" IN (' + buildServers.join(',') + ');UPDATE last_seen_channels SET "TIME" = ' + cTime + ' WHERE "ID" IN (' + buildChannels.join(',') + ');', callback);
}

setInterval(updateLastSeenFunc, 60000);

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
	
	if (channel.type == 'dm') {
		console.trace('Tried to define channel ID when it is PM!');
		return;
	}
	
	let serverID = DBot.ServersIDs[channel.guild.id];
	
	if (!serverID)
		throw 'Server ID was never defined';
	
	MySQL.query('SELECT ' + sql.Channel(channel) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		DBot.ChannelIDs[id] = data[0].ID;
		DBot.ChannelIDs_R[data[0].ID] = channel;
		hook.Run('ChannelInitialized', channel, data[0].ID);
		channel.uid = data[0].ID;
	});
}

let updateRole = function(role) {
	let perms = role.serialize();
	let arr = [];
	
	for (let name in perms) {
		if (perms[name])
			arr.push(name);
	}
	
	let arr2 = sql.Array(arr) + '::discord_permission[]';
	
	let col = Util.parseHexColor(role.hexColor);
	let colStr = '(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
	
	let finalQuery = 'INSERT INTO roles_names VALUES (' + Util.escape(role.uid) + ', ' + Util.escape(role.name) + ') ON CONFLICT ("ROLEID") DO UPDATE SET "NAME" = ' + Util.escape(role.name) + ';';
	finalQuery += 'INSERT INTO roles_perms VALUES (' + role.uid + ', ' + arr2 + ') ON CONFLICT ("ID") DO UPDATE SET "PERMS" = ' + arr2 + ';';
	finalQuery += 'INSERT INTO roles_options VALUES (' + sql.UConcat(Util.escape(role.uid), colStr, Util.escape(role.hoist), Util.escape(role.position), Util.escape(role.mentionable)) + ') ON CONFLICT ("ID") DO UPDATE SET "COLOR_R" = ' + colStr + ', "HOIST" = ' + Util.escape(role.hoist) + ', "POSITION" = ' + Util.escape(role.position) + ', "MENTION" = ' + Util.escape(role.mentionable) + ';';
	
	Postgres.query(finalQuery)
}

let updateRoles = function(roles) {
	let namesQuery;
	let optionsQuery;
	let permsQuery;
	
	let rolesDup = {};
	
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
		
		if (namesQuery)
			namesQuery += ',';
		else
			namesQuery = '';
		
		if (optionsQuery)
			optionsQuery += ',';
		else
			optionsQuery = '';
		
		if (permsQuery)
			permsQuery += ',';
		else
			permsQuery = '';
		
		namesQuery += '(' + Util.escape(role.uid) + ', ' + Util.escape(role.name) + ')';
		optionsQuery += '(' + sql.UConcat(Util.escape(role.uid), colStr, Util.escape(role.hoist), Util.escape(role.position), Util.escape(role.mentionable)) + ')';
		permsQuery += '(' + role.uid + ', ' + arr2 + ')';
	}
	
	let finalQuery = 'INSERT INTO roles_names ("ROLEID", "NAME") VALUES ' + namesQuery + ' ON CONFLICT ("ROLEID") DO UPDATE SET "NAME" = excluded."NAME";'
		+ 'INSERT INTO roles_perms VALUES ' + permsQuery + ' ON CONFLICT ("ID") DO UPDATE SET "PERMS" = excluded."PERMS";'
		+ 'INSERT INTO roles_options VALUES ' + optionsQuery + ' ON CONFLICT ("ID") DO UPDATE SET "COLOR_R" = excluded."COLOR_R", "HOIST" = excluded."HOIST", "POSITION" = excluded."POSITION", "MENTION" = excluded."MENTION";';
	
	Postgres.query(finalQuery);
}

DBot.DefineRole = function(role, callback) {
	if (!DBot.IsReady()) return;
	MySQL.query('SELECT ' + sql.Role(role) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		role.uid = data[0].ID;
		updateRole(role);
		hook.Run('RoleInitialized', role, role.uid);
		
		if (typeof callback == 'function')
			callback(role, data[0].ID);
	});
}

hook.Add('RoleChanged', 'MySQL.Handlers', function(oldRole, newRole) {
	if (!DBot.IsReady()) return;
	if (!oldRole.guild.uid)
		return;
	
	newRole.uid = newRole.uid || oldRole.uid;
	
	if (!newRole.uid) {
		DBot.DefineRole(newRole);
		return;
	}
	
	updateRole(newRole);
});

let MembersTable = {};

DBot.GetMember = function(ID) {
	return MembersTable[ID] || null;
}

DBot.DefineMember = function(obj) {
	if (!DBot.IsReady()) return;
	if (obj.uid) return;
	
	if (DBot.MemberIDs[obj.user.id] && DBot.MemberIDs[obj.user.id][obj.guild.id]) {
		obj.uid = DBot.MemberIDs[obj.user.id][obj.guild.id];
		return;
	}
	
	MySQL.query('SELECT ' + sql.Member(obj) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		obj.uid = data[0].ID;
		hook.Run('MemberInitialized', obj, obj.uid);
		
		MembersTable[obj.uid] = obj;
	});
}

DBot.DefineGuild = function(guild) {
	let id = guild.id;
	if (DBot.ServersIDs[id]) {
		guild.uid = DBot.ServersIDs[id];
		return;
	}
	
	MySQL.query('SELECT ' + sql.Server(guild) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		DBot.ServersIDs[id] = data[0].ID;
		DBot.ServersIDs_R[data[0].ID] = guild;
		guild.uid = data[0].ID;
		
		hook.Run('GuildInitialized', guild, data[0].ID);
		hook.Run('ServerInitialized', guild, data[0].ID);
		guild.channels.array().forEach(DBot.DefineChannel);
		guild.roles.array().forEach(DBot.DefineRole);
	});
	
	for (let member of guild.members.values()) {
		DBot.DefineUser(member.user);
		DBot.DefineMember(member);
	}
}

hook.Add('ServerInitialized', 'MySQL.Saves', function(server, id) {
	if (!DBot.SQLReady()) return;
	if (!server.name) return;
	
	Postgre.query('INSERT INTO last_seen_servers VALUES (' + id + ', ' + Math.floor(CurTime()) + ') ON CONFLICT ("ID") DO UPDATE SET "TIME" = ' + Math.floor(CurTime()));
	
	MySQL.query('INSERT INTO server_names ("ID", "NAME") VALUES (' + id + ', ' + Util.escape(server.name) + ') ON CONFLICT ("ID") DO UPDATE SET "NAME" = ' + Util.escape(server.name), function(err) {
		if (!err)
			return;
		
		console.error('Failed to save server name ' + id + ' (' + server.name + ')!');
		console.error(err);
	});
});

hook.Add('ServersInitialized', 'MySQL.Saves', function(servers) {
	let finalQuery;
	
	for (let server of servers) {
		if (!server.name) continue;
		
		if (finalQuery)
			finalQuery += ',';
		else
			finalQuery = '';
		
		finalQuery += '(' + server.uid + ', ' + Util.escape(server.name) + ')';
	}
	
	if (!finalQuery) return;
	
	MySQL.query('INSERT INTO server_names ("ID", "NAME") VALUES ' + finalQuery + ' ON CONFLICT ("ID") DO UPDATE SET "NAME" = excluded."NAME"', function(err) {
		if (err) console.error(err);
	});
});

hook.Add('ChannelInitialized', 'MySQL.Saves', function(channel, id) {
	if (!DBot.SQLReady()) return;
	if (!channel.name) return;
	
	Postgre.query('INSERT INTO last_seen_channels VALUES (' + id + ', ' + Math.floor(CurTime()) + ') ON CONFLICT ("ID") DO UPDATE SET "TIME" = ' + Math.floor(CurTime()));
	
	MySQL.query('INSERT INTO channel_names ("ID", "NAME") VALUES (' + id + ', ' + Util.escape(channel.name) + ') ON CONFLICT ("ID") DO UPDATE SET "NAME" = ' + Util.escape(channel.name), function(err) {
		if (!err)
			return;
		
		console.error('Failed to save channel name ' + id + ' (' + channel.name + ')!');
		console.error(err);
	});
});

hook.Add('ChannelsInitialized', 'MySQL.Saves', function(channels) {
	let finalQuery;
	
	for (let channel of channels) {
		if (!channel.name) continue;
		
		if (finalQuery)
			finalQuery += ',';
		else
			finalQuery = '';
		
		finalQuery += '(' + channel.uid + ', ' + Util.escape(channel.name) + ')';
	}
	
	if (!finalQuery) return;
	
	MySQL.query('INSERT INTO channel_names ("ID", "NAME") VALUES ' + finalQuery + ' ON CONFLICT ("ID") DO UPDATE SET "NAME" = excluded."NAME"', function(err) {
		if (err) console.error(err);
	});
});

DBot.DefineServer = DBot.DefineGuild;

let LoadingLevel = 0;
DBot.SQL_START = false;

DBot.SQLReady = function() {
	return LoadingLevel <= 0 && DBot.SQL_START;
}

DBot.IsReady = function() {
	return DBot.IsOnline() && LoadingLevel <= 0 && DBot.SQL_START;
}

hook.Add('BotOnline', 'RegisterIDs', function(bot) {
	if (LoadingLevel > 0)
		return;
	
	DBot.SQL_START = true;
	
	let build = [];
	let users = [];
	let users1 = {};
	let members = [];
	
	let servers = DBot.GetServers();
	let servers2 = bot.guilds;
	
	for (let server of servers) {
		if (!server.id)
			continue; // DiscordSocketTheBugFiner
		
		build.push(server.id);
		
		for (let member of server.members.array()) {
			// members.push(member);
			if (!member.user.id)
				continue; // DiscordSocketTheBugFiner
			
			users1[member.user.id] = member.user;
		}
	}
	
	for (let i in users1) {
		if (!users1[i].id)
			continue; // DiscordSocketTheBugFiner
		
		users.push(users1[i].id);
		LoadingUser[users1[i].id] = true;
	}
	
	LoadingLevel = 6;
	
	Postgre.query('SELECT get_servers_id(' + sql.Array(build) + '::CHAR(64)[]);', function(err, data) {
		if (err) throw err;
		
		LoadingLevel--;
		let channels1 = [];
		let channels2 = [];
		let channel_map = [];
		let role_map = {};
		let role_array = [];
		let role_array_ids = [];
		let serverArrayToPass = [];
		
		for (let row of data) {
			let exp = row.get_servers_id.split(',');
			let id = Number(exp[0].substr(1));
			let uid = exp[1].substr(0, exp[1].length - 1);
			
			let srv = servers2.get(uid)
			let shouldCall = srv.uid === undefined && DBot.ServersIDs[srv.id] === undefined;
			
			DBot.ServersIDs[uid] = id;
			DBot.ServersIDs_R[id] = srv;
			
			srv.uid = id;
			
			if (shouldCall) {
				hook.Run('GuildInitialized', srv, id);
				hook.Run('ServerInitialized', srv, id);
				serverArrayToPass.push(srv);
			}
			
			let roleMap = [[], {}];
			role_map[id] = roleMap;
			
			for (role of srv.roles.array()) {
				roleMap[0].push(role.id);
				roleMap[1][role.id] = role;
				
				role_array.push(role);
				role_array_ids.push(role.id);
			}
			
			for (let channel of srv.channels.array()) {
				channels1.push(channel.id);
				channels2.push(id);
				channel_map[channel.id] = channel;
			}
		}
		
		hook.Run('ServersInitialized', serverArrayToPass);
		
		let roleQuery = '';
		
		for (let serverid in role_map) {
			roleQuery += 'SELECT get_roles_id(' + serverid + ',' + sql.Array(role_map[serverid][0]) + '::VARCHAR(64)[]);';
		}
		
		Postgre.query(roleQuery, function(err, data) {
			if (err) {
				console.log(roleQuery);
				throw err;
			}
			
			LoadingLevel--;
			
			let roleHashMap = {};
			let role_array_uids = [];
			
			for (let row of data) {
				let exp = row.get_roles_id.split(',');
				let id = Number(exp[0].substr(1));
				let uid = exp[1];
				let serverid = Number(exp[2].substr(0, exp[2].length - 1));
				
				if (!serverid || !role_map[serverid])
					throw new Error('Invalid server in role result: ' + serverid + ' ' + row.get_roles_id);
				
				let mapped = role_map[serverid];
				let role = mapped[1][uid];
				
				let shouldCall = role.uid === undefined;
				
				role.uid = id;
				
				roleHashMap[id] = role;
				role_array_uids.push(id);
				
				if (shouldCall)
					hook.Run('RoleInitialized', role, role.uid);
			}
			
			updateRoles(role_array);
			hook.Run('RolesInitialized', role_map, role_array, role_array_ids, roleHashMap, role_array_uids);
		});
		
		let q = 'SELECT get_channels_id(' + sql.Array(channels1) + '::CHAR(64)[],' + sql.Array(channels2) + '::INTEGER[])';
		Postgre.query(q, function(err, data) {
			if (err) {
				console.log(q);
				throw err;
			}
			
			LoadingLevel--;
			
			let channelArrayToPass = [];
			
			for (let row of data) {
				let exp = row.get_channels_id.split(',');
				let id = Number(exp[0].substr(1));
				let uid = exp[1].substr(0, exp[1].length - 1);
				
				let channel = channel_map[uid];
				let shouldCall = channel.uid === undefined && DBot.ChannelIDs[channel.id] === undefined;
				
				channel.uid = id;
				DBot.ChannelIDs[uid] = id;
				DBot.ChannelIDs_R[id] = channel;
				
				if (shouldCall) {
					hook.Run('ChannelInitialized', channel, id);
					channelArrayToPass.push(channel);
				}
			}
			
			hook.Run('ChannelsInitialized', channelArrayToPass);
		});
		
		Postgre.query('SELECT get_users_id(' + sql.Array(users) + '::CHAR(64)[]);', function(err, data) {
			if (err) throw err;
			
			LoadingLevel--;
			
			let ctime = Math.floor(CurTime());
			
			let usersArrayToPass = [];
			let membersArrayToPass = [];
			
			for (let row of data) {
				let exp = row.get_users_id.split(',');
				let id = Number(exp[0].substr(1));
				let uid = exp[1].substr(0, exp[1].length - 1);
				
				let user = users1[uid];
				let shouldCall = user.uid === undefined && DBot.UsersIDs[user.id] === undefined;
				
				if (shouldCall)
					usersArrayToPass.push(user);
				
				user.uid = id;
				
				DBot.UsersIDs[uid] = id;
				DBot.UsersIDs_R[id] = user;
				
				LoadingUser[uid] = undefined;
				
				if (shouldCall) {
					hook.Run('UserInitialized', user, id);
					hook.Run('ClientInitialized', user, id);
				}
			}
			
			let memberInit = false;
			let updateInit = false;
			
			updateLastSeenFunc(function() {
				LoadingLevel--;
				hook.Run('UsersInitialized', usersArrayToPass);
				updateInit = true;
				
				if (memberInit)
					hook.Run('MembersInitialized', membersArrayToPass);
			});
			
			let members1 = [];
			let members2 = [];
			let members_map = [];
			
			for (let server of servers) {
				for (let member of server.members.array()) {
					if (!member.user.uid || !member.guild.uid) {
						continue; // WHAT THE FUCK
					}
					
					members1.push(member.user.uid);
					members2.push(member.guild.uid);
					
					members_map[member.user.uid] = members_map[member.user.uid] || [];
					members_map[member.user.uid][member.guild.uid] = member;
				}
			}
			
			let q = 'SELECT get_members_id(' + sql.Array(members1) + '::INTEGER[],' + sql.Array(members2) + '::INTEGER[])';
			Postgre.query(q, function(err, data) {
				if (err) {
					console.log(q);
					throw err;
				}
				
				LoadingLevel--;
				
				for (let row of data) {
					let exp = row.get_members_id.split(',');
					let id = Number(exp[0].substr(1));
					let userid = Number(exp[1]);
					let serverid = Number(exp[2].substr(0, exp[2].length - 1));
					
					let member = members_map[userid][serverid];
					
					if (!member)
						continue; // WTF?
					
					let shouldCall = member.uid === undefined && (!DBot.MemberIDs[member.user.id] || DBot.MemberIDs[member.user.id][member.guild.id] === undefined);
					
					if (shouldCall)
						membersArrayToPass.push(member);
					
					member.uid = id;
					MembersTable[member.uid] = member;
					
					if (shouldCall)
						hook.Run('MemberInitialized', member, member.uid);
				}
				
				memberInit = true;
				
				if (updateInit)
					hook.Run('MembersInitialized', membersArrayToPass);
			});
		});
	});
});
