

// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

'use strict';

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

DBot.loadingString = '';
const loadingDB = {};

const updateLoadingStatus = function() {
	if (DBot.LOADING_LEVEL > 0)
		DBot.Status('Loading, left [' + DBot.LOADING_LEVEL + '/' + DBot.maximalLoadingValue + '] stages');
	else
		DBot.Status('Finishing up...');
	
	DBot.loadingString = null;
	
	for (const i in loadingDB) {
		if (loadingDB[i]) {
			if (DBot.loadingString)
				DBot.loadingString += ', ' + i;
			else
				DBot.loadingString = i;
		}
	}
};

DBot.updateLoadingLevel = function(type) {
	for (let i = 1; i < arguments.length; i++) {
		const arg = arguments[i];
		loadingDB[arg] = type;
		DBot.LOADING_LEVEL = 0;
		
		for (let ii in loadingDB)
			if (loadingDB[ii]) DBot.LOADING_LEVEL++;

		updateLoadingStatus();
	}
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
	
	for (let ii in loadingDB)
		loadingDB[ii] = false;
	
	DBot.updateLoadingLevel(true, 'servers', 'roles', 'channels', 'users', 'members', 'stamps update');
	
	hook.Run('UpdateLoadingLevel', DBot.updateLoadingLevel);
	DBot.maximalLoadingValue = DBot.LOADING_LEVEL;
	
	updateLoadingStatus();
	
	serversCollection.updateMap();
	serversCollection.load(function() {
		DBot.updateLoadingLevel(false, 'servers');
		
		serversCollection.updateMap();
		hook.Run('ServersInitialized', serversCollection.objects);
		
		rolesCollection.updateMap();
		rolesCollection.load(function() {
			DBot.updateLoadingLevel(false, 'roles');
			rolesCollection.updateMap();
			hook.Run('RolesInitialized', rolesCollection, serversCollection);
		});
		
		channelCollection.updateMap();
		channelCollection.load(function() {
			DBot.updateLoadingLevel(false, 'channels');
			channelCollection.updateMap();
			hook.Run('ChannelsInitialized', channelCollection.objects, channelCollection);
		});
		
		users.updateMap();
		users.load(function() {
			DBot.updateLoadingLevel(false, 'users');
			
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
				DBot.updateLoadingLevel(false, 'members');
				
				sql.updateLastSeenFunc(function() {
					DBot.updateLoadingLevel(false, 'stamps update');
					
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

