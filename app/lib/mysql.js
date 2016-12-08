
const mysql = require('mysql');
const utf8 = require('utf8');
const fs = require('fs');
const pg = require('pg');

const sqlConfig = {
	host     : 'localhost',
	user     : 'discord_bot',
	password : '',
	database : 'discord_bot'
}

const pgConfig = {
	user: 'notdbot', //env var: PGUSER
	database: 'notdbot', //env var: PGDATABASE
	password: 'notdbot', //env var: PGPASSWORD
	host: 'localhost', // Server hosting the postgres database
	port: 5432, //env var: PGPORT
}

const sqlConfigMulti = {
	multipleStatements: true,
	host     : 'localhost',
	user     : 'discord_bot',
	password : '',
	database : 'discord_bot'
}

var connection = mysql.createConnection(sqlConfig);
var connectionMulti = mysql.createConnection(sqlConfigMulti);
let pgConnection = new pg.Client(pgConfig);

DBot.MySQL = connection;
DBot.MySQLM = connectionMulti;
MySQL = connection;
MySQLM = connectionMulti;

let sql = fs.readFileSync('./app/mysql.sql', 'utf8').replace(/\r/gi, '');
let split = sql.split('-- ///Functions///');
let sqlData = split[0];
let sqlFuncs = split[1];

connection.connect(function(err) {
	if (err)
		return;
	
	connection.query('SET NAMES utf8mb4');
	
	let fSplit = sqlFuncs.split('//');
	
	for (let f of fSplit) {
		if (f.replace(/(\n| )/gi, '') == '')
			continue;
		
		connection.query(f, function(err) {
			if (err) throw err;
		});
	}
});

pgConnection.connect(function(err) {
	if (err)
		throw err;
	
	let sSplit = sqlData.split(';');
	
	for (let q of sSplit) {
		if (q.replace(/(\n| )/gi, '') == '')
			continue;
	}
});

connectionMulti.connect(function(err) {
	if (err)
		return;
	
	connectionMulti.query('SET NAMES utf8');
	
	connectionMulti.query(sqlData, function(err) {
		if (err) throw err;
		
		hook.Run('SQLInitialize');
	});
});

DBot.Query = function(str, callback) {
	DBot.MySQL.query(str, callback);
}

DBot.query = function(str, callback) {
	DBot.MySQL.query(str, callback);
}

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
	
	DBot.query('SELECT get_user_id("' + id + '") AS `ID`', function(err, data) {
		if (err) throw err;
		DBot.UsersIDs[id] = data[0].ID;
		DBot.UsersIDs_R[data[0].ID] = user;
		LoadingUser[id] = undefined;
		hook.Run('UserInitialized', user, data[0].ID);
		hook.Run('ClientInitialized', user, data[0].ID);
	});
}

hook.Add('UserInitialized', 'MySQL.Saves', function(user, id) {
	MySQL.query('REPLACE INTO `user_names` (`ID`, `USERNAME`) VALUES (' + id + ', ' + MySQL.escape(utf8.encode(user.username)) + ')', function(err) {
		if (!err)
			return;
		
		console.error('Failed to save username for user ' + id + ' (' + user.username + ')!');
		console.error(err);
	});
});

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
	
	DBot.query('SELECT get_channel_id("' + id + '", "' + serverID + '") AS `ID`', function(err, data) {
		if (err) throw err;
		DBot.ChannelIDs[id] = data[0].ID;
		DBot.ChannelIDs_R[data[0].ID] = channel;
		hook.Run('ChannelInitialized', channel, data[0].ID);
	});
}

hook.Add('ChannelInitialized', 'MySQL.Saves', function(channel, id) {
	MySQL.query('REPLACE INTO `channel_names` (`ID`, `NAME`) VALUES (' + id + ', ' + MySQL.escape(utf8.encode(channel.name)) + ')', function(err) {
		if (!err)
			return;
		
		console.error('Failed to save channel name ' + id + ' (' + channel.name + ')!');
		console.error(err);
	});
});

DBot.DefineRole = function(role) {
	let id = role.id;
	let uid = DBot.GetServerID(role.guild);
	
	MySQL.query('SELECT get_role_id("' + id + '", ' + uid + ') AS `ID`', function(err, data) {
		if (err) throw err;
		role.uid = data[0].ID;
		MySQL.query('REPLACE INTO `roles_names` VALUES (' + Util.escape(role.uid) + ', ' + Util.escape(role.name) + ')');
		hook.Run('RoleInitialized', role, role.uid);
	});
}

DBot.DefineMember = function(member) {
	let id = member.user.id;
	let uid = member.guild.id;
	
	MySQL.query('SELECT get_member_id("' + id + '", ' + uid + ') AS `ID`', function(err, data) {
		if (err) throw err;
		member.uid = data[0].ID;
		MySQL.query('REPLACE INTO `member_names` VALUES (' + Util.escape(member.uid) + ', ' + Util.escape(member.nickname || member.user.username) + ')');
		hook.Run('MemberInitialized', member, member.uid);
	});
}

DBot.DefineGuild = function(guild) {
	let id = guild.id;
	if (DBot.ServersIDs[id])
		return;
	
	DBot.query('SELECT get_server_id("' + id + '") AS `ID`', function(err, data) {
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
	MySQL.query('REPLACE INTO `server_names` (`ID`, `NAME`) VALUES (' + id + ', ' + MySQL.escape(utf8.encode(server.name)) + ')', function(err) {
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
