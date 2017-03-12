
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;

const fs = require('fs');

DBot.sql = sql;
DBot.ChannelIDs = DBot.ChannelIDs || {};
DBot.ServersIDs = DBot.ServersIDs || {};
DBot.UsersIDs = DBot.UsersIDs || {};
DBot.MemberIDs = DBot.MemberIDs || {};

DBot.ChannelIDs_R = DBot.ChannelIDs_R || {};
DBot.ServersIDs_R = DBot.ServersIDs_R || {};
DBot.UsersIDs_R = DBot.UsersIDs_R || {};
DBot.MemberIDs_R = DBot.MemberIDs_R || {};

require('./sql_connection.js');
require('./sql_functions.js');
require('./sql_classes.js');
require('./sql_helpers.js');

const Postgres = myGlobals.Postgres;

if (DBot.SQL_START === undefined)
	DBot.SQL_START = 0;

if (DBot.SQL_START === undefined)
	DBot.SQL_START = false;

if (DBot.maximalLoadingValue === undefined)
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
	
	const serversCollection = new sql.ServerSQLCollection();
	const users = new sql.UserSQLCollection();
	const channelCollection = new sql.ChannelSQLCollection();
	const rolesCollection = new sql.RoleSQLCollection();
	const members = new sql.MemberSQLCollection();
	
	const users1 = {};
	
	for (const [serverID, server] of DBot.bot.guilds) {
		serversCollection.push(server);
		
		for (const [memberid, member] of server.members) {
			users1[memberid] = member.user;
			members.push(member);
		}
		
		for (const [roleID, role] of server.roles) {
			rolesCollection.push(role);
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
		DBot.updateLoadingLevel(false);
		
		serversCollection.updateMap();
		hook.Run('ServersInitialized', serversCollection.objects);
		
		rolesCollection.updateMap();
		rolesCollection.load(function() {
			DBot.updateLoadingLevel(false);
			rolesCollection.updateMap();
			hook.Run('RolesInitialized', rolesCollection, serversCollection);
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
			
			const queries = [];
			let current = null;
			let cI = 0;
			
			for (const user of users) {
				if (!user.avatarURL) continue;
				cI++;
				
				if (current)
					current += `,(${user.uid}, '${user.avatarURL}')`;
				else
					current = `(${user.uid}, '${user.avatarURL}')`;
				
				if (cI >= 500) {
					queries.push(current);
					current = null;
					cI = 0;
				}
			}
			
			if (current !== null)
				queries.push(current);
			
			for (const q of queries) {
				Postgres.query(`UPDATE users SET "AVATAR" = m."AVATAR" FROM (VALUES ${q}) AS m ("ID", "AVATAR") WHERE users."ID" = m."ID";`);
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

