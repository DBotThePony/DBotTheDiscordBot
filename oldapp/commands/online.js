

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
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const hDuration = require('humanize-duration');
const moment = require('moment');

module.exports = {
	name: 'online',
	alias: ['lastonline', 'lonline'],
	
	help_args: '<user>',
	desc: 'Tries to remember when user was last online',
	allowUserArgument: true,
	argNeeded: true,
	
	func: function(args, cmd, msg) {
		if (typeof args[0] !== 'object')
			return 'Must be an user ;n;';
		
		if (args[0].presence.status !== 'offline')
			return 'User is online i think?';
		
		let uid = DBot.GetUserID(args[0]);
		
		Postgres.query('SELECT "LASTONLINE" FROM uptime WHERE "ID" = ' + uid, function(err, data) {
			if (err || !data || !data[0]) {
				msg.reply('<internal pony error>');
				return;
			}
			
			let cTime = Math.floor(CurTime());
			let delta = cTime - data[0].LASTONLINE;
			
			let deltaStr = hDuration(delta * 1000);
			let mom = moment.unix(data[0].LASTONLINE + TimezoneOffset());
			
			let formated = mom.format('dddd, MMMM Do YYYY, HH:mm:ss');
			
			msg.reply('As i remember user <@' + args[0].id + '> was last online at\n`' + formated + ' UTC +0:00` (' + deltaStr + ' ago)');
		});
	}
};

DBot.RegisterCommand({
	name: 'uptime',
	
	help_args: '[user]',
	desc: 'Tries to remember how much user is online',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (typeof args[0] === 'object' && args[0].id !== DBot.bot.user.id) {
			let uid = DBot.GetUserID(args[0]);
			
			Postgres.query('SELECT * FROM uptime WHERE "ID" = ' + uid, function(err, data) {
				if (err || !data || !data[0]) {
					msg.reply('<internal pony error>');
					return;
				}
				
				let TOTAL_ONLINE = data[0].TOTAL_ONLINE;
				let ONLINE = data[0].ONLINE;
				let AWAY = data[0].AWAY;
				let DNT = data[0].DNT;
				let STAMP = data[0].STAMP;
				let TOTAL_TIME = CurTime() - STAMP;
				let TOTAL_OFFLINE = data[0].TOTAL_OFFLINE;
				let offlinePercent = TOTAL_OFFLINE / (TOTAL_ONLINE + TOTAL_OFFLINE);
				let onlinePercent = 1 - offlinePercent;
				
				let output = '\n```';
				
				output += 'User:                           @' + args[0].username + ' <@' + args[0].id + '>\n';
				output += 'Total online time:              ' + hDuration(Math.floor(TOTAL_ONLINE) * 1000) + '\n';
				output += 'Total offline time:             ' + hDuration(Math.floor(TOTAL_OFFLINE) * 1000) + '\n';
				output += 'Online percent:                 ' + (Math.floor(onlinePercent * 10000) / 100) + '%\n';
				output += 'Total time "online":            ' + hDuration(Math.floor(ONLINE) * 1000) + '\n';
				output += 'Total time "away":              ' + hDuration(Math.floor(AWAY) * 1000) + '\n';
				output += 'Total time "dnd":               ' + hDuration(Math.floor(DNT) * 1000) + '\n';
				output += 'Total time tracked:             ' + hDuration(Math.floor(TOTAL_TIME) * 1000) + '\n';
				output += '\n';
				output += 'Start of track: ' + moment.unix(STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + '\n';
				output += 'Data is *not* accurate because i can be offline sometimes\n';
				
				output += '```';
				
				msg.channel.sendMessage(output);
			});
		} else {
			Postgres.query('SELECT * FROM uptime_bot', function(err, data) {
				let TOTAL_ONLINE = data[0].AMOUNT;
				let TOTAL_TIME = CurTime() - data[0].START;
				let TOTAL_OFFLINE = TOTAL_TIME - TOTAL_ONLINE;
				
				let offlinePercent = TOTAL_OFFLINE / TOTAL_TIME;
				let onlinePercent = 1 - offlinePercent;
				
				let output = '\n```';
				
				output += '--------- My uptime statistics\n';
				output += 'Current session uptime:         ' + hDuration(Math.floor((CurTime() - DBot.START_STAMP)) * 1000) + '\n';
				output += 'Total online time:              ' + hDuration(Math.floor(TOTAL_ONLINE) * 1000) + '\n';
				output += 'Total offline time:             ' + hDuration(Math.floor(TOTAL_OFFLINE) * 1000) + '\n';
				output += 'Online percent:                 ' + (Math.floor(onlinePercent * 10000) / 100) + '%\n';
				
				output += '```';
				msg.channel.sendMessage(output);
			});
		}
	}
});
