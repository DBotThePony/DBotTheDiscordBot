
DBot.CommandsAntiSpam = {};

DBot.ParseString = function(str) {
	var charset = str.split('');
	var nextHaveNoAction = false;
	var output = [];
	var current = '';
	var inDouble = false;
	var inSingle = false;
	
	for (let i in charset) {
		let item = charset[i];
		if (nextHaveNoAction) {
			nextHaveNoAction = false;
			current += item;
			continue;
		}
		
		if (item == ' ' && !inDouble && !inSingle) {
			if (current != '')
				output.push(current);
			current = '';
			continue;
		}
		
		if (item == '\\') {
			nextHaveNoAction = true;
			continue;
		}
		
		if (item == '"') {
			if (inDouble) {
				if (inSingle) {
					current += item;
				} else {
					if (current != '')
						output.push(current);
					else
						output.push(null);
					
					current = '';
					inDouble = false;
				}
			} else {
				if (inSingle) {
					current += item;
				} else {
					inDouble = true;
				}
			}
			
			continue;
		}
		
		if (item == '\'') {
			if (inSingle) {
				if (inDouble) {
					current += item;
				} else {
					if (current != '')
						output.push(current);
					else
						output.push(null);
					
					current = '';
					inSingle = false;
				}
			} else {
				if (inDouble) {
					current += item;
				} else {
					inSingle = true;
				}
			}
			
			continue;
		}
		
		current += item;
	}
	
	if (current != '')
		output.push(current);
	
	for (let i in output) {
		if (output[i] == null)
			output[i] = '';
	}
	
	return output;
}

DBot.TrimArray = function(arr) {
	var newArray = [];
	
	arr.forEach(function(item, i) {
		if (item != '') {
			newArray.push(item);
		}
	});
	
	return newArray;
}

DBot.__LastMoreCommand = {};
DBot.__LastRetryCommand = {};

hook.Add('ChannelInitialized', 'LastMoreCommand', function(channel) {
	DBot.__LastMoreCommand[channel.id] = {};
	DBot.__LastRetryCommand[channel.id] = {};
});

var CompareStrings = function(Str1, Str2) {
	var result = Math.min(Str1.length, Str2.length);
	
	for (var I1 in Str1) {
		if (I1 > Str2.length) {
			result--;
			continue;
		}
		
		if (Str1[I1] != Str2[I1])
			result--;
	}
	
	return result;
}

var findRelated = function(str) {
	var matches = [];
	var len = str.length;
	var minimum = len * .6;
	
	for (var Command in DBot.Commands) {
		var comp = CompareStrings(Command, str);
		
		if (comp >= minimum) {
			matches.push([Command, comp]);
		}
	}
	
	if (!matches[0])
		return [];
	
	matches.sort(function(a, b) {
		if (a[1] < b[1]) {
			return 1;
		} else {
			return -1;
		}
		
		return 0;
	});
	
	return matches;
}

var SpamScore = {};

setInterval(function() {
	for (let i in SpamScore) {
		if (SpamScore[i] > 0) {
			SpamScore[i]--;
		}
	}
}, 1000);

DBot.ExecuteCommand = function(cCommand, msg, parsedArgs, rawcmd, command, rawmessage, extraArgument) {
	var can = hook.Run('ExecuteCommand', msg.author, command, msg);
	
	if (can === false)
		return;
	
	SpamScore[cCommand.id] = SpamScore[cCommand.id] || 0;
	SpamScore[cCommand.id]++;
	
	if (SpamScore[cCommand.id] > 4) {
		msg.reply('You all, stop spamming `' + cCommand.id + '`');
		return;
	}
	
	var timeout = cCommand.delay || 1.5;
	var curr = UnixStamp();
	
	if (DBot.CommandsAntiSpam[msg.author.id] && !DBot.DISABLE_ANTISPAM) {
		var delta = DBot.CommandsAntiSpam[msg.author.id] - curr;
		if (delta > 0) {
			msg.reply(':broken_heart: P... please, wait before running a new command. Wait ' + (Math.floor(delta * 10)) / 10 + ' seconds');
			return;
		}
	}
	
	DBot.CommandsAntiSpam[msg.author.id] = curr + timeout;
	
	if ((!parsedArgs || !parsedArgs[0]) && cCommand.argNeeded) {
		var messageFromCommand = cCommand.failMessage || 'Invalid arguments';
		
		msg.reply(messageFromCommand + Util.HighlightHelp([cCommand.id, '<missing>'], 2) + 'Help:\n```' + DBot.BuildHelpStringForCommand(command) + '```\n');
		return;
	}
	
	if (cCommand.allowUserArgument) {
		for (var k in parsedArgs) {
			var user = DBot.IdentifyUser(parsedArgs[k]);
			
			if (user)
				parsedArgs[k] = user;
			else if (parsedArgs[k] == '@me') {
				parsedArgs[k] = msg.author;
			}
		}
	}
	
	if (cCommand.checkAccess) {
		var reply = cCommand.checkAccess(parsedArgs, rawcmd, rawmessage || msg.content, msg);
		
		if (!reply) {
			msg.reply('No access');
			return;
		}
	}
	
	if (!DBot.__LastMoreCommand[msg.channel.id]) {
		// PM channel workaround
		DBot.__LastMoreCommand[msg.channel.id] = {};
	}
	
	if (!DBot.__LastRetryCommand[msg.channel.id]) {
		// PM channel workaround
		DBot.__LastRetryCommand[msg.channel.id] = {};
	}
	
	if (cCommand.id != 'more' && cCommand.id != 'retry') {
		if (cCommand.more) {
			DBot.__LastMoreCommand[msg.channel.id][msg.author.id] = [cCommand, parsedArgs, rawcmd, rawmessage || msg.content, extraArgument];
		}
		
		DBot.__LastRetryCommand[msg.channel.id][msg.author.id] = [cCommand, parsedArgs, rawcmd, rawmessage || msg.content, extraArgument];
	}
	
	hook.Run('PreExecuteCommand', cCommand.id, msg.author, parsedArgs, rawcmd, rawmessage || msg.content, msg, extraArgument);
	
	try {
		var reply = cCommand.func(parsedArgs, rawcmd, rawmessage || msg.content, msg, extraArgument);
	} catch(err) {
		msg.reply('<internal pony error>');
		console.error(err);
		return;
	}
	
	hook.Run('PostExecuteCommand', cCommand.id, msg.author, parsedArgs, rawcmd, rawmessage || msg.content, msg, extraArgument);
	hook.Run('CommandExecuted', cCommand.id, msg.author, parsedArgs, rawcmd, rawmessage || msg.content, msg, extraArgument);
	
	if (reply)
		msg.reply(reply);
	else if (reply === false)
		msg.reply('I don\'t know what to do with that :\\');
	
	return reply;
}

cvars.ServerVar('prefix', '}', [FCVAR_ONECHAR_ONLY], 'Prefix of bot commands on server');
cvars.ServerVar('prefix_disable', '0', [FCVAR_BOOLONLY], 'Disable bot prefix. In this case, you can command to bot only by @Mention');

DBot.HandleMessage = function(msg, isPrivate) {
	var shift = 1;
	
	if (isPrivate)
		shift = 0;
	
	var rawmessage = msg.content;
	
	if (rawmessage == '') {
		if (isPrivate) {
			if (msg.attachments) {
				msg.reply('Oh! A Picture x3');
			}
		}
		
		return;
	}
	
	var splitted = DBot.TrimArray(rawmessage.split(' '));
	
	var ServerBans;
	var ChannelBans;
	var prefix = '}';
	
	if (!isPrivate) {
		ServerBans = DBot.ServerCBans(msg.channel.guild);
		ChannelBans = DBot.ChannelCBans(msg.channel);
		prefix = cvars.Server(msg.channel.guild).getVar('prefix').getString();
	}
	
	if (rawmessage.substr(0, 1) == prefix) {
		if (isPrivate) {
			msg.reply('Oh, you don\'t need } in PM messages x3\nTry without }');
			return;
		}
		
		var recreate = [];
		recreate.push(prefix);
		
		splitted[0] = splitted[0].substr(1);
		
		for (var i in splitted) {
			recreate.push(splitted[i]);
		}
		
		splitted = recreate;
	}
	
	var rawCommand = splitted[shift];
	
	if (!rawCommand)
		return;
	
	var command = rawCommand.toLowerCase();
	
	/*
		splitted[shift - 1] = Our ID
		splitted[shift] = Command
		splitted[...] = arguments
	*/
	
	var can = hook.Run('CanExecuteCommand', msg.author, command, msg);
	
	if (can === false)
		return;
	
	if (!DBot.Commands[command]) {
		var output = 'I don\'t know what to do with that :\\';
		var related = findRelated(command);
		
		if (related[0] && related[0][1] > 1) {
			output += '\nMaybe you mean `' + related[0][0] + '`?';
		}
		
		msg.reply(output);
		return;
	}
	
	if (ServerBans && ServerBans.isBanned(command)) {
		msg.reply('Command is banned on entrie server ;w;');
		return;
	}
	
	if (ChannelBans && ChannelBans.isBanned(command)) {
		msg.reply('Command is banned on this channel ;w;');
		return;
	}
	
	var cCommand = DBot.Commands[command];
	
	if (cCommand.id != command && cCommand.name != command) {
		if (ServerBans && ServerBans.isBanned(cCommand.id)) {
			msg.reply('Command is banned on entrie server ;w;');
			return;
		}
		
		if (ChannelBans && ChannelBans.isBanned(cCommand.id)) {
			msg.reply('Command is banned on this channel ;w;');
			return;
		}
		
		if (ServerBans && ServerBans.isBanned(cCommand.name)) {
			msg.reply('Command is banned on entrie server ;w;');
			return;
		}
		
		if (ChannelBans && ChannelBans.isBanned(cCommand.name)) {
			msg.reply('Command is banned on this channel ;w;');
			return;
		}
	}
	
	var rawcmd = '';
	var first = true;
	
	for (i = 1 + shift; i < splitted.length; i++) {
		if (splitted[i] == '')
			continue;
		
		if (first) {
			rawcmd = splitted[i];
			first = false;
		} else
			rawcmd += ' ' + splitted[i];
	}
	
	var parsedArgs = DBot.ParseString(rawcmd);
	
	DBot.ExecuteCommand(cCommand, msg, parsedArgs, rawcmd, command);
}
