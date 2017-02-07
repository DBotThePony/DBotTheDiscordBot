
const fs = DBot.js.fs;

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
}

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
}

DBot.RegisterCommandPipe = function(command) {
	DBot.RegisterCommand(command);
	DBot.RegisterPipe(command);
	return command;
}

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

Util.SafeCopy('./resource/help.css', DBot.WebRoot + '/help.css');

let BuildCommands = function() {
	// Build help pages
	
	let III = 0;
	let cPage = 1;
	let totalPages = 1;
	let III2 = 0;
	
	for (let k in DBot.Commands) {
		if (k != DBot.Commands[k].id && k != DBot.Commands[k].name)
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
		if (k != item.id && k != item.name)
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
	
	// Building HTML helps
	
	let stream = fs.createWriteStream(DBot.WebRoot + '/help.html');
	
	stream.write("<!DOCTYPE HTML>\
<html>\
<head>\
<title>NotDBot's command list</title>\
<meta charset='utf-8' />\
<link href='help.css' rel='stylesheet' type='text/css' />\
</head>\
<body>\
<span id='commlist'>\
<span id='commlist_header'>Command List</span>\
<span id='commlist_start'>");
	
	for (let k in DBot.Commands) {
		let item = DBot.Commands[k];
		if (k != item.id && k != item.name)
			continue;
		
		if (item.help_hide)
			continue;
		
		stream.write(" • <a href='#command_" + k + "'>" + k + "</a>");
	}
	
	stream.write("</span></span><span id='pipelist'>\
<span id='pipelist_header'>Pipes List</span>\
<span id='pipelist_start'>");
	
	for (let k in DBot.CommandsPipes) {
		let item = DBot.CommandsPipes[k];
		if (k != item.id && k != item.name)
			continue;
		
		if (item.help_hide)
			continue;
		
		stream.write(" • <a href='#pipe_" + k + "'>" + k + "</a>");
	}
	
	stream.write("</span></span><span id='commands'>");
	
	for (let k in DBot.Commands) {
		let item = DBot.Commands[k];
		if (k != item.id && k != item.name)
			continue;
		
		if (item.help_hide)
			continue;
		
		let str = k;
		
		stream.write("</a><span class='command' id='command_" + k + "'><span class='command_header' name='command_" + k + "'>" + str + "</span>");
		
		let help = 'Usage: ' + item.id;
		
		if (item.alias) {
			help = '(aliases: ' + item.alias.join(', ') + ')\n' + help;
		}
		
		if (item.help_args)
			help += ' ' + item.help_args + '\n';
		else
			help += '\n';
		
		if (item.desc)
			help += item.desc + '\n';
		
		if (item.descFull)
			output += item.descFull;
		
		stream.write("<span class='command_desc'>" + ParseMarkdown(help) + "</span></span>");
	}
	
	stream.write('</span>');
	stream.write("<span id='pipelist_header2'>Pipes</span><span id='pipes'>");
	
	for (let k in DBot.CommandsPipes) {
		let item = DBot.CommandsPipes[k];
		if (k != item.id && k != item.name)
			continue;
		
		if (item.help_hide)
			continue;
		
		let str = k;
		
		stream.write("</a><span class='command' id='pipe_" + k + "'><span class='command_header' name='pipe_" + k + "'>" + str + "</span>");
		
		let help = 'Usage: ' + item.id;
		
		if (item.alias) {
			help = '(aliases: ' + item.alias.join(', ') + ')\n' + help;
		}
		
		if (item.help_args)
			help += ' ' + item.help_args + '\n';
		else
			help += '\n';
		
		if (item.desc)
			help += item.desc + '\n';
		
		if (item.descFull)
			output += item.descFull;
		
		stream.write("<span class='pipe_desc'>" + ParseMarkdown(help) + "</span></span>");
	}
	
	stream.write('</span></body></html>');
	stream.end();
}

DBot.BuildHelpString = function(page) {
	if (!BuildHelp[1]) {
		BuildCommands();
	}
	
	return BuildHelp[page] || BuildHelp[1];
}

DBot.BuildHelpStringForCommand = function(command) {
	command.toLowerCase();
	
	if (!DBot.Commands[command])
		return 'Unknown command';
	
	let output = '';
	let data = DBot.Commands[command];
	
	if (data.id == command)
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
}

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
	},
});

DBot.RegisterCommand({
	name: 'invite',
	
	help_args: '',
	desc: 'Displays invite link',
	
	func: function(args, cmd, msg) {
		return 'Link https://discordapp.com/api/oauth2/authorize?client_id=' + DBot.bot.user.id + '&scope=bot&permissions=0\nPlease don\'t invite bot to heavy (>600 users) servers, bot runs on home desktop PC with limited resources and internet\nDon\'t spam heavy commands (pleeease!)\nYou can join DBot\'s Discord Server https://discord.gg/HG9eS79';
	},
});
