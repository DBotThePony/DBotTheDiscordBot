
DBot.CommandsAntiSpam = {};

DBot.ParseString = function(str) {
	var charset = str.split('');
	var nextHaveNoAction = false;
	var output = [];
	var current = '';
	var inDouble = false;
	var inSingle = false;
	
	charset.forEach(function(item) {
		if (nextHaveNoAction) {
			nextHaveNoAction = false;
			current += item;
			return;
		}
		
		if (item == ' ' && !inDouble && !inSingle) {
			if (current != '')
				output.push(current);
			current = '';
			return;
		}
		
		if (item == '\\') {
			nextHaveNoAction = true;
			return;
		}
		
		if (item == '"') {
			if (inDouble) {
				if (inSingle) {
					current += item;
				} else {
					if (current != '')
						output.push(current);
					
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
			
			return;
		}
		
		if (item == '\'') {
			if (inSingle) {
				if (inDouble) {
					current += item;
				} else {
					if (current != '')
						output.push(current);
					
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
			
			return;
		}
		
		current += item;
	});
	
	if (current != '')
		output.push(current);
	
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

DBot.ExecuteCommand = function(cCommand, msg, parsedArgs, rawcmd, command, rawmessage, extraArgument) {
	var can = hook.Run('ExecuteCommand', msg.author, command, msg);
	
	if (can === false)
		return;
	
	var timeout = cCommand.delay || 1.5;
	var curr = UnixStamp();
	
	if (DBot.CommandsAntiSpam[msg.author.id]) {
		var delta = DBot.CommandsAntiSpam[msg.author.id] - curr;
		if (delta > 0) {
			msg.reply(':broken_heart: P... please, wait before running a new command. Wait ' + (Math.floor(delta * 10)) / 10 + ' seconds');
			return;
		}
	}
	
	DBot.CommandsAntiSpam[msg.author.id] = curr + timeout;
	
	if ((!parsedArgs || !parsedArgs[0]) && cCommand.argNeeded) {
		var messageFromCommand = cCommand.failMessage || 'Invalid arguments';
		
		msg.reply(messageFromCommand + '\nHelp:\n' + DBot.BuildHelpStringForCommand(command));
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
	var reply = cCommand.func(parsedArgs, rawcmd, rawmessage || msg.content, msg, extraArgument);
	hook.Run('PostExecuteCommand', cCommand.id, msg.author, parsedArgs, rawcmd, rawmessage || msg.content, msg, extraArgument);
	hook.Run('CommandExecuted', cCommand.id, msg.author, parsedArgs, rawcmd, rawmessage || msg.content, msg, extraArgument);
	
	if (reply)
		msg.reply(reply);
	else if (reply === false)
		msg.reply('I don\'t know what to do with that :\\');
}

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
	
	if (!isPrivate) {
		ServerBans = DBot.ServerCBans(msg.channel.guild);
		ChannelBans = DBot.ChannelCBans(msg.channel);
	}
	
	if (rawmessage.substr(0, 1) == '}') {
		if (isPrivate) {
			msg.reply('Oh, you don\'t need } in PM messages x3\nTry without }');
			return;
		}
		
		var recreate = [];
		recreate.push('}');
		
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
		msg.reply('I don\'t know what to do with that :\\');
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
