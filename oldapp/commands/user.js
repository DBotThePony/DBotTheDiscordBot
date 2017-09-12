

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

module.exports = {
	name: 'user',
	alias: ['userinfo'],
	
	allowUserArgument: true,
	nopm: true,
	
	help_args: '[user]',
	desc: 'Prints information about user',
	
	func: function(args, cmd, msg) {
		if (typeof(args[0]) !== 'object')
			args[0] = this.author;
		
		let member = this.server.member(args[0]);
		
		if (!member) {
			member = this.member;
			args[0] = this.author;
		}
		
		let output = '\n```';
		let roles = [];
		let servers = [];
		
		for (const role of member.roles.values())
			roles.push(role.name);
		
		for (const server of DBot.bot.guilds.values())
			if (server.members.get(member.id))
				servers.push(server.name);
		
		output += 'User ID:           ' + args[0].id + '\n';
		output += 'User Avatar:       ' + (args[0].avatarURL || '<no avatar>') + '\n';
		output += 'User Avatar ID:    ' + (args[0].avatar || '<no avatar>') + '\n';
		output += 'User Name:         ' + args[0].username + '\n';
		output += 'Discord Join Date: ' + Util.formatStamp(args[0].createdTimestamp / 1000) + '\n';
		output += 'Server Join Date:  ' + Util.formatStamp(member.joinedTimestamp / 1000) + '\n';
		output += 'User roles:        `' + roles.join(', ') + '`\n';
		output += 'Seen on:           `' + servers.join(', ') + '`\n';
		output += 'Is a bot?:         ' + (args[0].bot && 'yes' || 'no') + '\n';
		
		return output + '```';
	}
};
