
const utf8 = require('utf8');
const fs = require('fs');
const pg = require('pg');

const pgConfig = {
	user: 'notdbot', //env var: PGUSER
	database: 'notdbot', //env var: PGDATABASE
	password: 'notdbot', //env var: PGPASSWORD
	host: 'localhost', // Server hosting the postgres database
	port: 5432, //env var: PGPORT
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
	
	let finished = false;
	
	setTimeout(function() {
		if (finished)
			return;
		
		// console.error('SLOW QUERY: ' + query);
	}, 6000);
	
	pgConnection.oldQuery(query, function(err, data) {
		finished = true;
		
		if (err) {
			if (!callback) {
				let newErr = new Error(err.message + '\n' + query);
				newErr.stack = 'PostgreSQL ERROR: ' + err.message + '\n' + query + '\n' + oldStack;
				
				throw newErr;
			}
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
				
				if (err && err.internalQuery) {
					err.stack = err.internalQuery + '\n' + err.stack;
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

DBot.ChannelIDs_R = {};
DBot.ServersIDs_R = {};
DBot.UsersIDs_R = {};

hook.Add('ValidClientLeftServer', 'MySQL.Handlers', function(user, server) {
	var id = user.id;
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

var ChannelDeleted = function(channel) {
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
	var id = obj.uid;
	
	if (!id) {
		DBot.DefineMember(obj);
		throw new Error('Initialize member first (' + (obj && (obj.nickname || obj.user.username) || 'null') + ')');
	}
	
	return id;
}

DBot.GetUserID = function(obj) {
	var id = obj.id;
	
	if (!DBot.UsersIDs[id]) {
		DBot.DefineUser(obj);
		throw new Error('Initialize user first (' + (obj && obj.username || 'null') + ')');
	}
	
	obj.uid = DBot.UsersIDs[id];
	return DBot.UsersIDs[id];
}

DBot.GetChannelID = function(obj) {
	var id = obj.id;
	
	if (!DBot.ChannelIDs[id]) {
		DBot.DefineChannel(obj);
		throw new Error('Initialize channel first (' + (obj && obj.name || 'null') + ')');
	}
	
	obj.uid = DBot.ChannelIDs[id];
	return DBot.ChannelIDs[id];
}

DBot.GetServerID = function(obj) {
	var id = obj.id;
	
	if (!DBot.ServersIDs[id]) {
		DBot.DefineServer(obj);
		throw new Error('Initialize server first (' + (obj && obj.name || 'null') + ')');
	}
	
	obj.uid = DBot.ServersIDs[id];
	return DBot.ServersIDs[id];
}

DBot.GetMemberIDSoft = function(obj) {
	var id = obj.uid;
	
	if (!id) {
		DBot.DefineMember(obj);
		return false;
	}
	
	return id;
}

DBot.GetUserIDSoft = function(obj) {
	var id = obj.id;
	
	if (!DBot.UsersIDs[id]) {
		DBot.DefineUser(obj);
		return false;
	}
	
	obj.uid = DBot.UsersIDs[id];
	return DBot.UsersIDs[id];
}

DBot.GetChannelIDSoft = function(obj) {
	var id = obj.id;
	
	if (!DBot.ChannelIDs[id]) {
		DBot.DefineChannel(obj);
		return false;
	}
	
	obj.uid = DBot.ChannelIDs[id];
	return DBot.ChannelIDs[id];
}

DBot.GetServerIDSoft = function(obj) {
	var id = obj.id;
	
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
	
	for (let server of DBot.bot.guilds.array()) {
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

hook.Add('ChannelInitialized', 'MySQL.Saves', function(channel, id) {
	if (!channel.name)
		return;
	
	Postgre.query('INSERT INTO last_seen_channels VALUES (' + id + ', ' + Math.floor(CurTime()) + ') ON CONFLICT ("ID") DO UPDATE SET "TIME" = ' + Math.floor(CurTime()));
	
	MySQL.query('INSERT INTO channel_names ("ID", "NAME") VALUES (' + id + ', ' + Util.escape(channel.name) + ') ON CONFLICT ("ID") DO UPDATE SET "NAME" = ' + Util.escape(channel.name), function(err) {
		if (!err)
			return;
		
		console.error('Failed to save channel name ' + id + ' (' + channel.name + ')!');
		console.error(err);
	});
});

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

DBot.DefineRole = function(role, callback) {
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
	if (!oldRole.guild.uid)
		return;
	
	newRole.uid = newRole.uid || oldRole.uid;
	
	if (!newRole.uid) {
		DBot.DefineRole(newRole);
		return;
	}
	
	updateRole(newRole);
});

let memberCache = [];
let MembersTable = {};

DBot.GetMember = function(ID) {
	return MembersTable[ID] || null;
}

DBot.DefineMember = function(member) {
	if (member.uid)
		return;
	
	let id = member.user.id;
	let uid = member.guild.id;
	
	MySQL.query('SELECT ' + sql.Member(member) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		member.uid = data[0].ID;
		hook.Run('MemberInitialized', member, member.uid);
		
		let hit = false;
		
		for (let i in memberCache) {
			let oldMem = memberCache[i];
			
			if (oldMem.id == member.id && oldMem.guild.id == member.guild.id) {
				memberCache[i] = member;
				break;
			}
		}
		
		MembersTable[member.uid] = member;
		
		if (!hit)
			memberCache.push(member);
	});
}

DBot.GetMembers = function() {
	return memberCache;
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
	if (!server.name)
		return;
	
	Postgre.query('INSERT INTO last_seen_servers VALUES (' + id + ', ' + Math.floor(CurTime()) + ') ON CONFLICT ("ID") DO UPDATE SET "TIME" = ' + Math.floor(CurTime()));
	
	MySQL.query('INSERT INTO server_names ("ID", "NAME") VALUES (' + id + ', ' + Util.escape(server.name) + ') ON CONFLICT ("ID") DO UPDATE SET "NAME" = ' + Util.escape(server.name), function(err) {
		if (!err)
			return;
		
		console.error('Failed to save server name ' + id + ' (' + server.name + ')!');
		console.error(err);
	});
});

DBot.DefineServer = DBot.DefineGuild;

let LoadingLevel = 0;

hook.Add('BotOnline', 'RegisterIDs', function(bot) {
	if (LoadingLevel > 0)
		return;
	
	let build = [];
	let users = [];
	let users1 = {};
	let members = [];
	
	let servers = bot.guilds.array();
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
	
	LoadingLevel = 5;
	
	Postgre.query('SELECT get_servers_id(' + sql.Array(build) + '::CHAR(64)[]);', function(err, data) {
		if (err) throw err;
		
		LoadingLevel--;
		let channels1 = [];
		let channels2 = [];
		let channel_map = [];
		
		for (let row of data) {
			let exp = row.get_servers_id.split(',');
			let id = Number(exp[0].substr(1));
			let uid = exp[1].substr(0, exp[1].length - 1);
			
			let srv = servers2.get(uid)
			DBot.ServersIDs[uid] = id;
			DBot.ServersIDs_R[id] = srv;
			
			srv.uid = id;
			
			hook.Run('GuildInitialized', srv, id);
			hook.Run('ServerInitialized', srv, id);
			
			// Needs better code
			srv.roles.array().forEach(DBot.DefineRole);
			
			for (let channel of srv.channels.array()) {
				channels1.push(channel.id);
				channels2.push(id);
				channel_map[channel.id] = channel;
			}
		}
		
		let q = 'SELECT get_channels_id(' + sql.Array(channels1) + '::CHAR(64)[],' + sql.Array(channels2) + '::INTEGER[])';
		Postgre.query(q, function(err, data) {
			if (err) {
				console.log(q);
				throw err;
			}
			
			LoadingLevel--;
			
			for (let row of data) {
				let exp = row.get_channels_id.split(',');
				let id = Number(exp[0].substr(1));
				let uid = exp[1].substr(0, exp[1].length - 1);
				
				let channel = channel_map[uid];
				channel.uid = id;
				DBot.ChannelIDs[uid] = id;
				DBot.ChannelIDs_R[id] = channel;
				
				hook.Run('ChannelInitialized', channel, id);
			}
		});
		
		Postgre.query('SELECT get_users_id(' + sql.Array(users) + '::CHAR(64)[]);', function(err, data) {
			if (err) throw err;
			
			LoadingLevel--;
			
			let ctime = Math.floor(CurTime());
			
			for (let row of data) {
				let exp = row.get_users_id.split(',');
				let id = Number(exp[0].substr(1));
				let uid = exp[1].substr(0, exp[1].length - 1);
				
				let user = users1[uid];
				user.uid = id;
				
				DBot.UsersIDs[uid] = id;
				DBot.UsersIDs_R[id] = user;
				
				LoadingUser[uid] = undefined;
				
				hook.Run('UserInitialized', user, id);
				hook.Run('ClientInitialized', user, id);
			}
			
			let memberInit = false;
			let updateInit = false;
			
			updateLastSeenFunc(function() {
				LoadingLevel--;
				hook.Run('UsersInitialized');
				updateInit = true;
				
				if (memberInit)
					hook.Run('MembersInitialized');
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
					
					if (!member) {
						continue; // WTF?
					}
					
					member.uid = id;
					MembersTable[member.uid] = member;
					hook.Run('MemberInitialized', member, member.uid);
					
					let hit = false;
					
					for (let i in memberCache) {
						let oldMem = memberCache[i];
						
						if (oldMem.id == member.id && oldMem.guild.id == member.guild.id) {
							memberCache[i] = member;
							break;
						}
					}
					
					if (!hit)
						memberCache.push(member);
				}
				
				memberInit = true;
				
				if (updateInit)
					hook.Run('MembersInitialized');
			});
		});
	});
});
