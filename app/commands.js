
/* global DBot, Util */

const fs = DBot.js.fs;
const pug = DBot.js.pug;

DBot.Commands = {};
DBot.CommandsPipes = {};

DBot.RegisterCommand = function(command) {
	if (command.alias) {
		for (let i in command.alias) {
			DBot.Commands[command.alias[i]] = command;
		}
	}
	
	let id = command.id || command.name;
	command.id = id;
	DBot.Commands[id] = command;
	
	return command;
};

DBot.RegisterPipe = function(pipe) {
	if (pipe.alias) {
		for (let i in pipe.alias) {
			DBot.CommandsPipes[pipe.alias[i]] = pipe;
		}
	}
	
	let id = pipe.id || pipe.name;
	pipe.id = id;
	DBot.CommandsPipes[id] = pipe;
	
	return pipe;
};

DBot.RegisterCommandPipe = function(command) {
	DBot.RegisterCommand(command);
	DBot.RegisterPipe(command);
	return command;
};

DBot.js.filesystem.readdirSync('./app/commands/').forEach(function(file) {
	let sp = file.split('.');
	if (!sp[1])
		return;
	
	let id = sp[0];
	
	let command = require('./commands/' + file);
	
	if (!command)
		return;
	
	if (!command.name)
		return;
	
	command.id = id;
	DBot.RegisterCommand(command);
});

try {
	DBot.js.filesystem.readdirSync('./app/pipes/').forEach(function(file) {
		let sp = file.split('.');
		if (!sp[1])
			return;
		
		let id = sp[0];
		
		let pipe = require('./pipes/' + file);
		
		if (!pipe)
			return;
		
		if (!pipe.name)
			return;
		
		pipe.id = id;
		DBot.RegisterPipe(pipe);
	});
} catch(err) {
	
}

let BuildHelp = [];
let ParseMarkdown = Util.ParseMarkdown;
const helpPath = DBot.WebRoot + '/help.html';

let BuildCommands = function() {
	// HTML help
	
	let commData = [];
	let pipeData = [];
	
	for (let k in DBot.Commands) {
		const item = DBot.Commands[k];
		if (k !== item.id && k !== item.name || item.help_hide) continue;
		let str = k;
		
		let cData = {};
		cData.name = k;
		
		cData.alias = item.alias && '(aliases: ' + item.alias.join(', ') + ')' || '';
		cData.args = item.help_args || '';
		cData.help = item.desc && ParseMarkdown(item.desc) || '';
		cData.fhelp = item.descFull && ParseMarkdown(item.descFull) || '';
		
		commData.push(cData);
	}
	
	for (let k in DBot.CommandsPipes) {
		const item = DBot.CommandsPipes[k];
		if (k !== item.id && k !== item.name || item.help_hide) continue;
		let str = k;
		
		let cData = {};
		cData.name = k;
		
		cData.alias = item.alias && '(aliases: ' + item.alias.join(', ') + ')' || '';
		cData.args = item.help_args || '';
		cData.help = item.desc && ParseMarkdown(item.desc) || '';
		cData.fhelp = item.descFull && ParseMarkdown(item.descFull) || '';
		
		pipeData.push(cData);
	}
	
	const rendered = pug.renderFile('./app/templates/help.pug', {
		commData: commData,
		pipeData: pipeData,
		title: 'Bot Help'
	});
	
	fs.writeFile(helpPath, rendered, console.errHandler);
	
	// Usual help
	
	let III = 0;
	let cPage = 1;
	let totalPages = 1;
	let III2 = 0;
	
	for (let k in DBot.Commands) {
		if (k !== DBot.Commands[k].id && k !== DBot.Commands[k].name)
			continue;
		
		if (DBot.Commands[k].help_hide)
			continue;
		
		III2++;
		
		if (III2 > 10) {
			totalPages++;
			III2 = 0;
		}
	}
	
	let output = 'Help page: ' + cPage + '/' + totalPages + '\n```';
	
	for (let k in DBot.Commands) {
		let item = DBot.Commands[k];
		if (k !== item.id && k !== item.name)
			continue;
		
		if (item.help_hide)
			continue;
		
		output += ' - ' + k;
		
		if (item.alias) {
			output += ' (aliases are: ' + item.alias.join(', ') + ')';
		}
		
		if (item.desc) {
			output += '\n     --- ' + item.desc.replace(new RegExp('\n', 'g'), '\n         ') + '\n';
		} else {
			output += '\n';
		}
		
		III++;
		
		if (III > 10) {
			output += '```Full help (including pipe commands) is avaliable here: ' + DBot.URLRoot + '/help.html\nTo list a page: help <page>\nTo get help with specified command, type help <command>';
			III = 0;
			BuildHelp[cPage] = output;
			cPage++;
			output = 'Help page: ' + cPage + '/' + totalPages + '\n```';
			first = true;
		}
	}
	
	output += '```To list a page: help <page>\nTo get help with specified command, type help <command>';
	BuildHelp[cPage] = output;
};

DBot.BuildHelpString = function(page) {
	if (!BuildHelp[1]) {
		BuildCommands();
	}
	
	return BuildHelp[page] || BuildHelp[1];
};

DBot.BuildHelpStringForCommand = function(command) {
	command.toLowerCase();
	
	if (!DBot.Commands[command])
		return 'Unknown command';
	
	let output = '';
	let data = DBot.Commands[command];
	
	if (data.id === command)
		output = 'Usage: ' + command;
	else
		output = 'Usage: ' + data.id;
	
	if (data.help_args)
		output += ' ' + data.help_args + '\n';
	else
		output += '\n';
	
	if (data.alias) {
		output += 'Alias(es): ' + data.alias.join(', ') + '\n';
	}
	
	if (data.desc)
		output += data.desc + '\n';
	
	if (data.descFull)
		output += data.descFull;
	
	if (data.desc_full)
		output += data.desc_full;
	
	return output;
};

DBot.RegisterCommand({
	name: 'help',
	id: 'help',
	alias: ['h', 'commands'],
	
	argNeeded: false,
	failMessage: '',
	
	help_args: '[command]',
	desc: 'Displays help',
	
	func: function(args, cmd, msg) {
		let num = Number.from(args[0]);
		
		if (!args[0]) {
			msg.author.sendMessage(DBot.BuildHelpString());
			
			if (!DBot.IsPM(msg))
				return 'Look into your PM';
		} else if (num) {
			msg.author.sendMessage(DBot.BuildHelpString(num));
			
			if (!DBot.IsPM(msg))
				return 'Look into your PM';
		} else {
			return DBot.BuildHelpStringForCommand(args[0]);
		}
	}
});

DBot.RegisterCommand({
	name: 'invite',
	
	help_args: '',
	desc: 'Displays invite link',
	
	func: function(args, cmd, msg) {
		return 'Link https://discordapp.com/api/oauth2/authorize?client_id=' + DBot.bot.user.id + '&scope=bot&permissions=0\nPlease don\'t invite bot to heavy (>600 users) servers, bot runs on home desktop PC with limited resources and internet\nDon\'t spam heavy commands (pleeease!)\nYou can join DBot\'s Discord Server https://discord.gg/HG9eS79';
	}
});
