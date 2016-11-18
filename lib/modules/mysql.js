
var mysql = require('mysql');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'discord_bot',
	password : '',
	database : 'discord_bot'
});

connection.connect();

DBot.MySQL = connection;
MySQL = connection;

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

DBot.ChannelIDs = {};
DBot.ServersIDs = {};
DBot.UsersIDs = {};

hook.Add('OnJoinedServer', 'MySQL.Handlers', function(server) {
	DBot.DefineGuild(server);
});

hook.Add('ChannelCreated', 'MySQL.Handlers', function(channel) {
	DBot.DefineChannel(channel);
});

hook.Add('ChannelDeleted', 'MySQL.Handlers', function(channel) {
	DBot.ChannelIDs[channel.id] = undefined;
});

hook.Add('OnLeftServer', 'MySQL.Handlers', function(server) {
	DBot.ServersIDs[server.id] = undefined;
	
	server.channels.array().forEach(function(channel) {
		DBot.ChannelIDs[channel.id] = undefined;
	});
});

DBot.GetUserID = function(obj) {
	var id = obj.id;
	
	if (!DBot.UsersIDs[id])
		throw 'Initialize user first';
	
	return DBot.UsersIDs[id];
}

DBot.GetChannelID = function(obj) {
	var id = obj.id;
	
	if (!DBot.ChannelIDs[id])
		throw 'Initialize channel first';
	
	return DBot.ChannelIDs[id];
}

DBot.GetServerID = function(obj) {
	var id = obj.id;
	
	if (!DBot.ChannelIDs[id])
		throw 'Initialize server first';
	
	return DBot.ServersIDs[id];
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
				LoadingUser[id] = undefined;
				hook.Run('UserInitialized', user, data.insertId);
			});
		} else {
			DBot.UsersIDs[id] = data[0].ID;
			LoadingUser[id] = undefined;
			hook.Run('UserInitialized', user, data[0].ID);
		}
	});
}

DBot.DefineChannel = function(channel) {
	var id = channel.id;
	if (DBot.ChannelIDs[id])
		return;
	
	var serverID = DBot.ServersIDs[channel.guild.id];
	
	if (!serverID)
		throw 'Server ID was never defined';
	
	DBot.query('SELECT ID FROM channel_id WHERE UID = "' + id + '"', function(err, data) {
		if (!data[0]) {
			DBot.query('INSERT INTO channel_id (UID, SID) VALUES("' + id + '", "' + serverID + '")', function(err, data) {
				DBot.ChannelIDs[id] = data.insertId;
				hook.Run('ChannelInitialized', channel, data.insertId);
			});
		} else {
			DBot.ChannelIDs[id] = data[0].ID;
			hook.Run('ChannelInitialized', channel, data[0].ID);
		}
	});
}

DBot.DefineGuild = function(guild) {
	var id = guild.id;
	if (DBot.ServersIDs[id])
		return;
	
	DBot.query('SELECT ID FROM server_id WHERE UID = "' + id + '"', function(err, data) {
		if (!data[0]) {
			DBot.query('INSERT INTO server_id (UID) VALUES("' + id + '")', function(err, data) {
				DBot.ServersIDs[id] = data.insertId;
				hook.Run('GuildInitialized', guild, data.insertId);
				hook.Run('ServerInitialized', guild, data.insertId);
				guild.channels.array().forEach(DBot.DefineChannel);
			});
		} else {
			DBot.ServersIDs[id] = data[0].ID;
			hook.Run('GuildInitialized', guild, data[0].ID);
			hook.Run('ServerInitialized', guild, data[0].ID);
			guild.channels.array().forEach(DBot.DefineChannel);
		}
	});
	
	guild.members.array().forEach(DBot.DefineUser);
}

DBot.DefineServer = DBot.DefineGuild

hook.Add('BotOnline', 'RegisterIDs', function(bot) {
	var guilds = bot.guilds;
	var arr = guilds.array();
	
	arr.forEach(DBot.DefineGuild);
});
