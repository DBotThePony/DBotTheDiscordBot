
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
	
	pgConnection.oldQuery(query, function(err, data) {
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

hook.Add('ValidClientJoinsServer', 'MySQL.Handlers', function(user) {
	DBot.DefineUser(user);
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

DBot.GetUserID = function(obj) {
	var id = obj.id;
	
	if (!DBot.UsersIDs[id]) {
		DBot.DefineUser(obj);
		throw new Error('Initialize user first (' + (obj && obj.username || 'null') + ')');
	}
	
	return DBot.UsersIDs[id];
}

DBot.GetChannelID = function(obj) {
	var id = obj.id;
	
	if (!DBot.ChannelIDs[id]) {
		DBot.DefineChannel(obj);
		throw new Error('Initialize channel first (' + (obj && obj.name || 'null') + ')');
	}
	
	return DBot.ChannelIDs[id];
}

DBot.GetServerID = function(obj) {
	var id = obj.id;
	
	if (!DBot.ServersIDs[id]) {
		DBot.DefineServer(obj);
		throw new Error('Initialize server first (' + (obj && obj.name || 'null') + ')');
	}
	
	return DBot.ServersIDs[id];
}

DBot.GetUserIDSoft = function(obj) {
	var id = obj.id;
	
	if (!DBot.UsersIDs[id]) {
		DBot.DefineUser(obj);
		return false;
	}
	
	return DBot.UsersIDs[id];
}

DBot.GetChannelIDSoft = function(obj) {
	var id = obj.id;
	
	if (!DBot.ChannelIDs[id]) {
		DBot.DefineChannel(obj);
		return false;
	}
	
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
	
	if (DBot.UsersIDs[id])
		return;
	
	LoadingUser[id] = true;
	
	MySQL.query('SELECT ' + sql.User(user) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		DBot.UsersIDs[id] = data[0].ID;
		DBot.UsersIDs_R[data[0].ID] = user;
		LoadingUser[id] = undefined;
		hook.Run('UserInitialized', user, data[0].ID);
		hook.Run('ClientInitialized', user, data[0].ID);
	});
}

DBot.DefineChannel = function(channel) {
	let id = channel.id;
	if (DBot.ChannelIDs[id])
		return;
	
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
	});
}

hook.Add('ChannelInitialized', 'MySQL.Saves', function(channel, id) {
	MySQL.query('INSERT INTO channel_names ("ID", "NAME") VALUES (' + id + ', ' + Util.escape(channel.name) + ') ON CONFLICT ("ID") DO UPDATE SET "NAME" = ' + Util.escape(channel.name), function(err) {
		if (!err)
			return;
		
		console.error('Failed to save channel name ' + id + ' (' + channel.name + ')!');
		console.error(err);
	});
});

let updateRole = function(role) {
	MySQL.query('INSERT INTO roles_names VALUES (' + Util.escape(role.uid) + ', ' + Util.escape(role.name) + ') ON CONFLICT ("ROLEID") DO UPDATE SET "NAME" = ' + Util.escape(role.name));
	let perms = role.serialize();
	let arr = [];
	
	for (let name in perms) {
		if (perms[name])
			arr.push(name);
	}
	
	MySQL.query('DELETE FROM roles_perms WHERE "ID" = ' + role.uid + ';INSERT INTO roles_perms VALUES (' + role.uid + ', ' + sql.Array(arr) + '::discord_permission[]);');
}

DBot.DefineRole = function(role) {
	let id = role.id;
	let uid = DBot.GetServerID(role.guild);
	
	MySQL.query('SELECT ' + sql.Role(role) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		role.uid = data[0].ID;
		updateRole(role);
		hook.Run('RoleInitialized', role, role.uid);
	});
}

hook.Add('RoleCreated', 'MySQL.Handlers', DBot.DefineRole);
hook.Add('RoleChanged', 'MySQL.Handlers', function(oldRole, newRole) {
	newRole.uid = newRole.uid || oldRole.uid;
	
	if (!newRole.uid) {
		DBot.DefineRole(newRole);
		return;
	}
	
	updateRole(newRole);
});

let memberCache = [];

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
		
		if (!hit)
			memberCache.push(member);
	});
}

DBot.GetMembers = function() {
	return memberCache;
}

DBot.DefineGuild = function(guild) {
	let id = guild.id;
	if (DBot.ServersIDs[id])
		return;
	
	MySQL.query('SELECT ' + sql.Server(guild) + ' AS "ID"', function(err, data) {
		if (err) throw err;
		DBot.ServersIDs[id] = data[0].ID;
		DBot.ServersIDs_R[data[0].ID] = guild;
		
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
	MySQL.query('INSERT INTO server_names ("ID", "NAME") VALUES (' + id + ', ' + Util.escape(utf8.encode(server.name)) + ') ON CONFLICT ("ID") DO UPDATE SET "NAME" = ' + Util.escape(server.name), function(err) {
		if (!err)
			return;
		
		console.error('Failed to save server name ' + id + ' (' + server.name + ')!');
		console.error(err);
	});
});

DBot.DefineServer = DBot.DefineGuild

hook.Add('BotOnline', 'RegisterIDs', function(bot) {
	bot.guilds.array().forEach(DBot.DefineGuild);
});
