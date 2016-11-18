
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

DBot.HandleMessage = function(msg, isPrivate) {
	var shift = 1;
	
	if (isPrivate)
		shift = 0;
	
	var rawmessage = msg.content;
	var splitted = DBot.TrimArray(rawmessage.split(' '));
	var command = splitted[shift].toLowerCase();
	
	/*
		splitted[shift - 1] = Our ID
		splitted[shift] = Command
		splitted[...] = arguments
	*/
	
	if (!DBot.Commands[command]) {
		msg.reply('I don\'t know what to do with that :\\');
		return;
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
	
	var cCommand = DBot.Commands[command];
	var timeout = cCommand.delay || 1.5;
	var curr = UnixStamp();
	
	if (DBot.CommandsAntiSpam[msg.author.id]) {
		var delta = DBot.CommandsAntiSpam[msg.author.id] - curr;
		if (delta > 0) {
			msg.reply(':broken_heart: P... please, wait before running a new command. Wait ' + (Math.floor(delta / 100)) / 10 + ' seconds');
			return;
		}
	}
	
	DBot.CommandsAntiSpam[msg.author.id] = curr + timeout * 1000;
	
	if ((!parsedArgs || !parsedArgs[0]) && cCommand.argNeeded) {
		var messageFromCommand = cCommand.failMessage || 'Invalid arguments';
		
		msg.reply(messageFromCommand + '\nHelp:\n' + DBot.BuildHelpStringForCommand(command));
		return;
	}
	
	if (cCommand.checkAccess) {
		var reply = cCommand.checkAccess(parsedArgs, rawcmd, rawmessage, msg);
		
		if (!reply) {
			msg.reply('No access');
			return;
		}
	}
	
	var reply = cCommand.func(parsedArgs, rawcmd, rawmessage, msg);
	
	if (reply)
		msg.reply(reply);
}
