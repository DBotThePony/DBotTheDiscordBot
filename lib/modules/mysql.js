
var mysql = require('mysql');
var utf8 = require('utf8');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'discord_bot',
	password : '',
	database : 'discord_bot'
});

DBot.MySQL = connection;
MySQL = connection;

connection.connect(function(err) {
	if (err)
		return;
	
	connection.query('SET NAMES utf8mb4');
});

DBot.Query = function(str, callback) {
	DBot.MySQL.query(str, callback);
}

DBot.query = function(str, callback) {
	DBot.MySQL.query(str, callback);
}

DBot.MySQLTables = {};

DBot.DefineMySQLTable = function(tab, contents) {
	DBot.MySQLTables[tab] = contents;
	DBot.query('CREATE TABLE IF NOT EXISTS `' + tab + '` (' + contents + ')');
}

DBot.DefineMySQLTable('server_id', 'ID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, UID VARCHAR(64) NOT NULL');
DBot.DefineMySQLTable('channel_id', 'ID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, UID VARCHAR(64) NOT NULL, SID INTEGER NOT NULL');
DBot.DefineMySQLTable('user_id', 'ID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY, UID VARCHAR(64) NOT NULL');
DBot.DefineMySQLTable('user_names', 'ID INTEGER NOT NULL PRIMARY KEY, USERNAME VARCHAR(64) NOT NULL');
DBot.DefineMySQLTable('channel_names', '`ID` INTEGER NOT NULL PRIMARY KEY, `NAME` VARCHAR(64) NOT NULL');
DBot.DefineMySQLTable('server_names', '`ID` INTEGER NOT NULL PRIMARY KEY, `NAME` VARCHAR(64) NOT NULL');

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
	if (!DBot.UserIsInitialized(msg.author))
		return true;
	
	if (!DBot.IsPM(msg)) {
		if (!DBot.ChannelIsInitialized(msg.channel))
			return true;
		
		if (!DBot.ServerIsInitialized(msg.channel.guild))
			return true;
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

var LoadingUser = {};

DBot.DefineUser = function(user) {
	var id = user.id;
	
	if (LoadingUser[id])
		return;
	
	if (DBot.UsersIDs[id])
		return;
	
	LoadingUser[id] = true;
	
	DBot.query('SELECT ID FROM user_id WHERE UID = "' + id + '"', function(err, data) {
		if (!data[0]) {
			DBot.query('INSERT INTO user_id (UID) VALUES("' + id + '")', function(err, data) {
				DBot.UsersIDs[id] = data.insertId;
				DBot.UsersIDs_R[data.insertId] = user;
				LoadingUser[id] = undefined;
				hook.Run('UserInitialized', user, data.insertId);
				hook.Run('ClientInitialized', user, data.insertId);
			});
		} else {
			DBot.UsersIDs[id] = data[0].ID;
			DBot.UsersIDs_R[data[0].ID] = user;
			LoadingUser[id] = undefined;
			hook.Run('UserInitialized', user, data[0].ID);
			hook.Run('ClientInitialized', user, data[0].ID);
		}
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
	var id = channel.id;
	if (DBot.ChannelIDs[id])
		return;
	
	// PM
	if (!channel.guild)
		return;
	
	if (channel.type == 'dm') {
		console.trace('Tried to define channel ID when it is PM!');
		return;
	}
	
	var serverID = DBot.ServersIDs[channel.guild.id];
	
	if (!serverID)
		throw 'Server ID was never defined';
	
	DBot.query('SELECT ID FROM channel_id WHERE UID = "' + id + '"', function(err, data) {
		if (!data[0]) {
			DBot.query('INSERT INTO channel_id (UID, SID) VALUES("' + id + '", "' + serverID + '")', function(err, data) {
				DBot.ChannelIDs[id] = data.insertId;
				DBot.ChannelIDs_R[data.insertId] = channel;
				hook.Run('ChannelInitialized', channel, data.insertId);
			});
		} else {
			DBot.ChannelIDs[id] = data[0].ID;
			DBot.ChannelIDs_R[data[0].ID] = channel;
			hook.Run('ChannelInitialized', channel, data[0].ID);
		}
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

DBot.DefineGuild = function(guild) {
	var id = guild.id;
	if (DBot.ServersIDs[id])
		return;
	
	DBot.query('SELECT ID FROM server_id WHERE UID = "' + id + '"', function(err, data) {
		if (!data[0]) {
			DBot.query('INSERT INTO server_id (UID) VALUES("' + id + '")', function(err, data) {
				DBot.ServersIDs[id] = data.insertId;
				DBot.ServersIDs_R[data.insertId] = guild;
				hook.Run('GuildInitialized', guild, data.insertId);
				hook.Run('ServerInitialized', guild, data.insertId);
				guild.channels.array().forEach(DBot.DefineChannel);
			});
		} else {
			DBot.ServersIDs[id] = data[0].ID;
			DBot.ServersIDs_R[data[0].ID] = guild;
			hook.Run('GuildInitialized', guild, data[0].ID);
			hook.Run('ServerInitialized', guild, data[0].ID);
			guild.channels.array().forEach(DBot.DefineChannel);
		}
	});
	
	guild.members.array().forEach(function(obj) {DBot.DefineUser(obj.user);});
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
	var guilds = bot.guilds;
	var arr = guilds.array();
	
	arr.forEach(DBot.DefineGuild);
});
