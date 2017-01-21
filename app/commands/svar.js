
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
		
		var cvar = cvars.Server(msg.channel.guild).getVar(args[0]);
		
		if (!cvar) {
			return 'No such variable' + Util.HighlightHelp(['svar'], 2, args);
		}
		
		var isPrivate = cvar.haveFlag(FCVAR_PROTECTED);
		
		if (isPrivate && !msg.member.hasPermission('MANAGE_GUILD'))
			return 'Variable have "FCVAR_PROTECTED" flag and you don\'t have "MANAGE_GUILD" permissions! Uh oh! ;n;';
		
		if (args[1] === undefined) {
			if (isPrivate) {
				msg.author.sendMessage('```' + cvar.format() + '```');
			} else {
				msg.channel.sendMessage('```' + cvar.format() + '```');
			}
		} else {
			if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
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
					msg.channel.sendMessage('```Server variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
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
		
		var obj = cvars.Server(msg.channel.guild);
		var get = obj.cvarlist();
		
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
		
		var obj = cvars.Channel(msg.channel);
		var get = obj.cvarlist();
		
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
		var obj = cvars.Client(msg.author);
		var get = obj.cvarlist();
		
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
		
		var cvar = cvars.Channel(msg.channel).getVar(args[0]);
		
		if (!cvar) {
			return 'No such variable' + Util.HighlightHelp(['cvar'], 2, args);
		}
		
		var isPrivate = cvar.haveFlag(FCVAR_PROTECTED);
		
		if (isPrivate && !msg.member.hasPermission('MANAGE_GUILD'))
			return 'Variable have "FCVAR_PROTECTED" flag and you don\'t have "MANAGE_GUILD" permissions! Uh oh! ;n;';
		
		if (args[1] === undefined) {
			if (isPrivate) {
				msg.author.sendMessage('```' + cvar.format() + '```');
			} else {
				msg.channel.sendMessage('```' + cvar.format() + '```');
			}
		} else {
			if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
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
					msg.channel.sendMessage('```Channel variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
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
		let channel = DBot.FindChannel(channelID);
		
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
			if (!msg.member.hasPermission('MANAGE_GUILD') && msg.author.id != DBot.DBot)
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
					channel.sendMessage('```Channel variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
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
		
		var cvar = cvars.Client(msg.author).getVar(args[0]);
		
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
