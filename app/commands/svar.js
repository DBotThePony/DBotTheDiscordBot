

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
	name: 'svar',
	
	help_args: '<cvar> [new value]',
	desc: 'Server Variable manipulation. If no value specified, prints it\'s value',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (!args[0]) {
			return 'There must be variable name' + Util.HighlightHelp(['svar'], 2, args);
		}
		
		let cvar = cvars.Server(msg.channel.guild).getVar(args[0]);
		
		if (!cvar) {
			return 'No such variable' + Util.HighlightHelp(['svar'], 2, args);
		}
		
		let isPrivate = cvar.haveFlag(FCVAR_PROTECTED);
		
		if (isPrivate && !msg.member.hasPermission('MANAGE_GUILD'))
			return 'Variable have "FCVAR_PROTECTED" flag and you don\'t have "MANAGE_GUILD" permissions! Uh oh! ;n;';
		
		if (args[1] === undefined) {
			if (isPrivate) {
				msg.author.sendMessage('```' + cvar.format() + '```');
			} else {
				msg.channel.sendMessage('```' + cvar.format() + '```');
			}
		} else {
			if (!msg.member.hasPermission('MANAGE_GUILD') && !DBot.owners.includes(msg.author.id))
				return 'You must have "MANAGE_GUILD" rights to set server variables';
			
			let build;
			
			for (let i = 1; i < args.length; i++) {
				if (build)
					build += ' ' + args[i];
				else
					build = args[i];
			}
			
			let trySet = cvar.setValue(build, msg);
			
			if (!trySet[0]) {
				msg.reply('```' + cvars.ErrorMessages[trySet[1]] + '\n\n' + Util.HighlightHelp(['svar'], 3, args, true) + '```');
			} else {
				if (isPrivate) {
					msg.author.sendMessage('```Server variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
				} else {
					msg.sendMessage('```Server variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
				}
			}
		}
	}
}

DBot.RegisterCommand({
	name: 'svarlist',
	alias: ['svars'],
	
	help_args: '',
	desc: 'Prints server variables',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		let obj = cvars.Server(msg.channel.guild);
		let get = obj.cvarlist();
		
		if (get == '') {
			msg.channel.sendMessage('No variables to list');
			return;
		}
		
		msg.channel.sendMessage('```' + get + '```');
	}
});

DBot.RegisterCommand({
	name: 'cvarlist',
	alias: ['cvars'],
	
	help_args: '',
	desc: 'Prints channel variables',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		let obj = cvars.Channel(msg.channel);
		let get = obj.cvarlist();
		
		if (get == '') {
			msg.channel.sendMessage('No variables to list');
			return;
		}
		
		msg.channel.sendMessage('```' + get + '```');
	}
});

DBot.RegisterCommand({
	name: 'uvarlist',
	alias: ['uvars'],
	
	help_args: '',
	desc: 'Prints user variables into your PM.',
	
	func: function(args, cmd, msg) {
		let obj = cvars.Client(msg.author);
		let get = obj.cvarlist();
		
		if (get == '') {
			msg.author.sendMessage('No variables to list');
			return;
		}
		
		msg.author.sendMessage('```' + get + '```');
	}
});

DBot.RegisterCommand({
	name: 'cvar',
	
	help_args: '<cvar> [new value]',
	desc: 'Channel Variable manipulation. If no value specified, prints it\'s value',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (!args[0]) {
			return 'There must be variable name' + Util.HighlightHelp(['cvar'], 2, args);
		}
		
		let cvar = cvars.Channel(msg.channel).getVar(args[0]);
		
		if (!cvar) {
			return 'No such variable' + Util.HighlightHelp(['cvar'], 2, args);
		}
		
		let isPrivate = cvar.haveFlag(FCVAR_PROTECTED);
		
		if (isPrivate && !msg.member.hasPermission('MANAGE_GUILD'))
			return 'Variable have "FCVAR_PROTECTED" flag and you don\'t have "MANAGE_GUILD" permissions! Uh oh! ;n;';
		
		if (args[1] === undefined) {
			if (isPrivate) {
				msg.author.sendMessage('```' + cvar.format() + '```');
			} else {
				msg.channel.sendMessage('```' + cvar.format() + '```');
			}
		} else {
			if (!msg.member.hasPermission('MANAGE_GUILD') && !DBot.owners.includes(msg.author.id))
				return 'You must have "MANAGE_GUILD" rights to set channel variables';
			
			let build;
			
			for (let i = 1; i < args.length; i++) {
				if (build)
					build += ' ' + args[i];
				else
					build = args[i];
			}
			
			let trySet = cvar.setValue(build, msg);
			
			if (!trySet[0]) {
				msg.reply('```' + cvars.ErrorMessages[trySet[1]] + '\n\n' + Util.HighlightHelp(['cvar'], 3, args, true) + '```');
			} else {
				if (isPrivate) {
					msg.author.sendMessage('```Channel variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
				} else {
					msg.sendMessage('```Channel variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
				}
			}
		}
	}
});

DBot.RegisterCommand({
	name: 'mcvar',
	
	help_args: '<channel> <cvar> [new value]',
	desc: 'Channel Variable manipulation.\nInstead of manipulation of current channel variables, manipulates\nspecified channel variables\nIf no value specified, prints it\'s value',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (!args[0]) {
			return DBot.CommandError('Invalid channel', 'mcvar', args, 1);
		}
		
		if (!args[0].match(/^<#([0-9]+)>$/))
			return DBot.CommandError('Invalid channel', 'mcvar', args, 1);
		
		let channelID = args[0].substr(2, args[0].length - 3);
		let channel = DBot.bot.channels.get(channelID);
		
		if (!channel)
			return DBot.CommandError('Invalid channel', 'mcvar', args, 1);
		
		if (!args[1]) {
			return DBot.CommandError('Invalid variable', 'mcvar', args, 2);
		}
		
		let cvar = cvars.Channel(channel).getVar(args[1]);
		
		if (!cvar) {
			return DBot.CommandError('No such variable', 'mcvar', args, 2);
		}
		
		let isPrivate = cvar.haveFlag(FCVAR_PROTECTED);
		
		if (isPrivate && !msg.member.hasPermission('MANAGE_GUILD'))
			return 'Variable have "FCVAR_PROTECTED" flag and you don\'t have "MANAGE_GUILD" permissions! Uh oh! ;n;';
		
		if (args[2] === undefined) {
			if (isPrivate) {
				msg.author.sendMessage('```' + cvar.format() + '```');
			} else {
				msg.channel.sendMessage('```' + cvar.format() + '```');
			}
		} else {
			if (!msg.member.hasPermission('MANAGE_GUILD') && !DBot.owners.includes(msg.author.id))
				return 'You must have "MANAGE_GUILD" rights to set channel variables';
			
			let build;
			
			for (let i = 1; i < args.length; i++) {
				if (build)
					build += ' ' + args[i];
				else
					build = args[i];
			}
			
			let trySet = cvar.setValue(build, msg);
			
			if (!trySet[0]) {
				msg.reply(DBot.CommandError(cvars.ErrorMessages[trySet[1]], 'mcvar', args, 3));
			} else {
				if (isPrivate) {
					msg.author.sendMessage('```Channel variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
				} else {
					msg.sendMessage('```Channel variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
				}
			}
		}
	}
});

DBot.RegisterCommand({
	name: 'uvar',
	
	help_args: '<cvar> [new value]',
	desc: 'User (client) Variable manipulation. If no value specified, prints it\'s value\nIt is always printed in your PM.',
	
	func: function(args, cmd, msg) {
		if (!args[0]) {
			return 'There must be variable name' + Util.HighlightHelp(['uvar'], 2, args);
		}
		
		let cvar = cvars.Client(msg.author).getVar(args[0]);
		
		if (!cvar) {
			return 'No such variable' + Util.HighlightHelp(['uvar'], 2, args);
		}
		
		if (args[1] === undefined) {
			msg.author.sendMessage('```' + cvar.format() + '```');
		} else {
			let build;
			
			for (let i = 1; i < args.length; i++) {
				if (build)
					build += ' ' + args[i];
				else
					build = args[i];
			}
			
			let trySet = cvar.setValue(build, msg);
			
			if (!trySet[0]) {
				msg.reply('```' + cvars.ErrorMessages[trySet[1]] + '\n\n' + Util.HighlightHelp(['uvar'], 3, args, true) + '```');
			} else {
				msg.author.sendMessage('```Channel variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
			}
		}
	}
});
