
/* global hook, DBot, sql, Util, Symbol, Postgres, Postgres */

const fs = DBot.js.fs;

sql = {};
DBot.sql = sql;
DBot.ChannelIDs = {};
DBot.ServersIDs = {};
DBot.UsersIDs = {};
DBot.MemberIDs = {};

DBot.ChannelIDs_R = {};
DBot.ServersIDs_R = {};
DBot.UsersIDs_R = {};
DBot.MemberIDs_R = {};

require('./sql_connection.js');
require('./sql_functions.js');
require('./sql_classes.js');
require('./sql_helpers.js');

DBot.LOADING_LEVEL = 0;
DBot.SQL_START = false;
DBot.maximalLoadingValue = 0;

DBot.SQLReady = function() {
	return DBot.LOADING_LEVEL <= 0 && DBot.SQL_START;
};

DBot.IsReady = function() {
	return DBot.IsOnline() && DBot.LOADING_LEVEL <= 0 && DBot.SQL_START;
};

const updateLoadingStatus = function() {
	if (DBot.LOADING_LEVEL > 0)
		DBot.Status('Loading, left [' + DBot.LOADING_LEVEL + '/' + DBot.maximalLoadingValue + '] stages');
	else
		DBot.Status('Finishing up...');
};

DBot.updateLoadingLevel = function(type, times) {
	times = times || 1;
	
	if (type)
		DBot.LOADING_LEVEL += times;
	else
		DBot.LOADING_LEVEL -= times;
	
	if (DBot.LOADING_LEVEL < 0)
		DBot.LOADING_LEVEL = 0;
	
	updateLoadingStatus();
};

DBot.startSQL = function(bot) {
	if (DBot.LOADING_LEVEL > 0)
		return;
	
	DBot.SQL_START = true;
	
	let serversCollection = new sql.ServerSQLCollection();
	let users = new sql.UserSQLCollection();
	let users1 = {};
	const servers = DBot.GetServers();
	
	for (const server of servers) {
		if (!server.id) continue; // DiscordSocketTheBugFiner
		
		serversCollection.push(server);
		
		for (let member of server.members.array()) {
			if (!member.user.id) continue; // DiscordSocketTheBugFiner
			users1[member.user.id] = member.user;
		}
	}
	
	if (serversCollection.length === 0) return;
	
	for (let i in users1) {
		users.push(users1[i]);
		sql.LoadingUser[users1[i].id] = true;
	}
	
	DBot.LOADING_LEVEL = 6;
	
	hook.Run('UpdateLoadingLevel', DBot.updateLoadingLevel);
	DBot.maximalLoadingValue = DBot.LOADING_LEVEL;
	
	updateLoadingStatus();
	
	serversCollection.updateMap();
	serversCollection.load(function() {
		let channelCollection = new sql.ChannelSQLCollection();
		let rolesCollection = new sql.RoleSQLCollection();
		DBot.updateLoadingLevel(false);
		
		for (const server of servers) {
			for (const role of server.roles.array()) {
				rolesCollection.push(role);
			}
		}
		
		serversCollection.updateMap();
		hook.Run('ServersInitialized', serversCollection.objects);
		
		rolesCollection.updateMap();
		rolesCollection.load(function() {
			DBot.updateLoadingLevel(false);
			rolesCollection.updateMap();
			hook.Run('RolesInitialized', rolesCollection);
		});
		
		channelCollection.updateMap();
		channelCollection.load(function() {
			DBot.updateLoadingLevel(false);
			channelCollection.updateMap();
			hook.Run('ChannelsInitialized', channelCollection.objects, channelCollection);
		});
		
		users.updateMap();
		users.load(function() {
			DBot.updateLoadingLevel(false);
			
			let members = new sql.MemberSQLCollection();
			
			for (let server of servers) {
				for (let member of server.members.array()) {
					if (!member.user.uid || !member.guild.uid) continue; // WHAT THE FUCK
					members.push(member);
				}
			}
			
			members.updateMap();
			members.load(function() {
				DBot.updateLoadingLevel(false);
				
				sql.updateLastSeenFunc(function() {
					DBot.updateLoadingLevel(false);
					
					users.updateMap();
					members.updateMap();
					hook.Run('UsersInitialized', users.objects);
					hook.Run('MembersInitialized', members.objects);
				}, true);
			});
		});
	});
};

require('./sql_hooks.js');

