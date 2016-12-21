
DBot.CommandsAntiSpam = {};

DBot.ParseString = function(str, ignoreHandlers) {
	var charset = str.split('');
	var nextHaveNoAction = false;
	var output = [];
	var handlers = [];
	var current = '';
	var inDouble = false;
	var inSingle = false;
	var parsingHandlers = false;
	
	for (let item of charset) {
		if (nextHaveNoAction) {
			nextHaveNoAction = false;
			current += item;
			continue;
		}
		
		if (item == ' ' && !inDouble && !inSingle) {
			if (current != '') {
				if (!parsingHandlers) {
					output.push(current);
				} else {
					handlers.push(current);
				}
			}
			
			current = '';
			continue;
		}
		
		if (item == '\\') {
			nextHaveNoAction = true;
			continue;
		}
		
		if (item == '|' && !inSingle && !inDouble && !ignoreHandlers) {
			parsingHandlers = true;
			continue;
		}
		
		if (item == '"') {
			if (inDouble) {
				if (inSingle) {
					current += item;
				} else {
					if (current != '') {
						if (!parsingHandlers) {
							output.push(current);
						} else {
							handlers.push(current);
						}
					} else {
						if (!parsingHandlers) {
							output.push(null);
						} else {
							handlers.push(null);
						}
					}
					
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
					if (current != '') {
						if (!parsingHandlers) {
							output.push(current);
						} else {
							handlers.push(current);
						}
					} else {
						if (!parsingHandlers) {
							output.push(null);
						} else {
							handlers.push(null);
						}
					}
					
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
	
	if (current != '') {
		if (!parsingHandlers) {
			output.push(current);
		} else {
			handlers.push(current);
		}
	}
	
	for (let i in output) {
		if (output[i] == null)
			output[i] = '';
	}
	
	for (let i in handlers) {
		if (handlers[i] == null)
			handlers[i] = '';
	}
	
	return [output, handlers];
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
	let result = Math.min(Str1.length, Str2.length);
	
	for (let I1 in Str1) {
		if (I1 > Str2.length) {
			result--;
			continue;
		}
		
		let cond = Str1[I1] == Str2[I1];
		
		for (let i1 = -2; i <= 2; i++) {
			for (let i2 = -2; i <= 2; i++) {
				if (Str1[I1 + i1] != '' && Str2[I1 + i2] != '' && Str1[I1 + i1] == Str2[I1 + i2]) {
					cond = true;
					break;
				}
			}
			
			if (cond)
				break;
		}
		
		if (!cond)
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

DBot.ExecuteCommand = function(cCommand, msg, parsedArgs, rawcmd, command, extraArgument, parsedHandlers) {
	var can = hook.Run('ExecuteCommand', msg.author, command, msg);
	
	if (can === false) {
		return;
	}
	
	SpamScore[cCommand.id] = SpamScore[cCommand.id] || 0;
	SpamScore[cCommand.id]++;
	
	if (SpamScore[cCommand.id] > 8) {
		if (msg.channel.cooldown && msg.channel.cooldown > CurTime()) {
			msg.channel.cooldown = CurTime() + 1;
			return;
		}
		
		msg.reply('Stop spamming `' + cCommand.id + '`');
		msg.channel.cooldown = CurTime() + 1;
		
		return;
	}
	
	var timeout = cCommand.delay || 1.5;
	var curr = UnixStamp();
	
	if (DBot.CommandsAntiSpam[msg.author.id] && !DBot.DISABLE_ANTISPAM) {
		var delta = DBot.CommandsAntiSpam[msg.author.id] - curr;
		if (delta > 0) {
			if (msg.channel.cooldown && msg.channel.cooldown > CurTime()) {
				msg.channel.cooldown = CurTime() + 1;
				return;
			}
			
			msg.reply(':broken_heart: P... please, wait before running a new command. Wait ' + (Math.floor(delta * 10)) / 10 + ' seconds');
			msg.channel.cooldown = CurTime() + 1;
			
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
			if (typeof parsedArgs[k] != 'string') {
				continue;
			}
			
			var user = DBot.IdentifyUser(parsedArgs[k]);
			
			if (user)
				parsedArgs[k] = user;
			else if (parsedArgs[k] == '@me') {
				parsedArgs[k] = msg.author;
			}
		}
	}
	
	if (cCommand.checkAccess) {
		var reply = cCommand.checkAccess(parsedArgs, rawcmd, msg);
		
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
			DBot.__LastMoreCommand[msg.channel.id][msg.author.id] = [cCommand, parsedArgs, rawcmd, extraArgument, parsedHandlers];
		}
		
		DBot.__LastRetryCommand[msg.channel.id][msg.author.id] = [cCommand, parsedArgs, rawcmd, extraArgument, parsedHandlers];
	}
	
	msg.oldReply = msg.oldReply || msg.reply;
	msg.replies = msg.replies || [];
	msg.executesACommand = true;
	let PIPE_HIT = false;
	
	msg.promiseReply = function(str) {
		if (this.wasDeleted)
			return {then: function() {}, catch: function() {}};
		
		let promise = this.oldReply(str);
		let self = this;
		
		promise.then(function(nmsg) {
			self.replies.push(nmsg);
		});
		
		return promise;
	}
	
	msg.reply = function(str) {
		if (this.wasDeleted)
			return;
		
		if (PIPE_HIT) {
			let promise = this.oldReply(str);
			let self = this;
			
			promise.then(function(nmsg) {
				self.replies.push(nmsg);
			});
			
			return promise;
		}
		
		if (cCommand.id != 'more' && cCommand.id != 'retry' && parsedHandlers[0]) {
			let pipeID = parsedHandlers[0].toLowerCase();
			let pipe = DBot.CommandsPipes[pipeID];
			
			if (pipe) {
				let spliced = Util.CopyArray(parsedHandlers);
				spliced.splice(0, 1);
				let splitted = Util.AppendArrays(spliced, str.split(' '));
				
				let rawcmd = '';
				let first = true;
				
				for (let i in splitted) {
					if (first) {
						rawcmd = splitted[i];
						first = false;
					} else {
						rawcmd += ' ' + splitted[i];
					}
				}
				
				if (!pipe.no_touch)
					rawcmd = rawcmd.replace(/```/gi, '');
				
				let parsedData = DBot.ParseString(rawcmd, true);
				let parsedArgs = parsedData[0];
				
				PIPE_HIT = true;
				let reply;
				
				msg.reply = msg.promiseReply;
				
				try {
					reply = pipe.func(parsedArgs, rawcmd, msg);
				} catch(err) {
					msg.oldReply('<internal pony error>');
					console.error(err);
					return;
				}
				
				if (reply === true) {
					return;
				} else if (typeof reply == 'string') {
					return this.promiseReply(reply);
				} else if (reply === false) {
					return this.promiseReply('Pipe that you specified does not accept command output');
				}
			}
		}
		
		let promise = this.oldReply(str);
		let self = this;
		
		promise.then(function(nmsg) {
			self.replies.push(nmsg);
		});
		
		return promise;
	}
	
	hook.Run('PreExecuteCommand', cCommand.id, msg.author, parsedArgs, rawcmd, msg, extraArgument, parsedHandlers);
	
	try {
		var reply = cCommand.func(parsedArgs, rawcmd, msg, extraArgument);
	} catch(err) {
		msg.oldReply('<internal pony error>');
		console.error(err);
		return;
	}
	
	hook.Run('PostExecuteCommand', cCommand.id, msg.author, parsedArgs, rawcmd, msg, extraArgument, parsedHandlers);
	hook.Run('CommandExecuted', cCommand.id, msg.author, parsedArgs, rawcmd, msg, extraArgument, parsedHandlers);
	
	if (typeof reply == 'string') {
		msg.reply(reply);
	} else if (reply === false) {
		msg.oldReply('I don\'t know what to do with that :\\');
	}
	
	return reply;
}

hook.Add('OnMessageDeleted', 'Handler', function(msg) {
	msg.wasDeleted = true;
	
	if (!msg.replies)
		return;
	
	for (let mess of msg.replies) {
		if (mess.deletable)
			mess.delete(0);
	}
});

hook.Add('OnMessageEdit', 'Handler', function(omsg, nmsg) {
	if (!omsg.executesACommand)
		return;
	
	omsg.internalCreateTime = omsg.internalCreateTime || CurTime();
	nmsg.internalCreateTime = omsg.internalCreateTime;
	nmsg.replies = omsg.replies;
	
	if (omsg.internalCreateTime + 1 > CurTime())
		return;
	
	for (let mess of omsg.replies) {
		if (mess.deletable)
			mess.delete(0);
	}
	
	let can = DBot.HandleMessage(nmsg, DBot.IsPM(nmsg), true);
	
	if (can)
		DBot.HandleMessage(nmsg, DBot.IsPM(nmsg));
});

cvars.ServerVar('prefix', '}', [FCVAR_NOTNULL], 'Prefix of bot commands on server');
cvars.ChannelVar('prefix', '', [], 'Prefix of bot commands on current channel. If empty, uses server prefix instead');
cvars.ServerVar('prefix_disable', '0', [FCVAR_BOOLONLY], 'Disable bot prefix. In this case, you can command to bot only by @Mention');
cvars.ChannelVar('prefix_disable', '0', [FCVAR_BOOLONLY], 'Disable bot prefix in current channel. In this case, you can command to bot only by @Mention');

DBot.IsAskingMe = function(msg) {
	if (msg.content.substr(0, DBot.aidLen) == DBot.askId)
		return true;
	
	let prefix = '}';
	
	if (!DBot.IsPM(msg)) {
		if (cvars.Server(msg.channel.guild).getVar('prefix_disable').getBool())
			return false;
		
		if (cvars.Channel(msg.channel).getVar('prefix_disable').getBool())
			return false;
		
		let sPrefix = cvars.Server(msg.channel.guild).getVar('prefix').getString();
		let cPrefix = cvars.Channel(msg.channel).getVar('prefix').getString();
		
		if (cPrefix != '')
			prefix = cPrefix;
		else
			prefix = sPrefix;
	}
	
	if (msg.content.substr(0, 1) == prefix)
		return true;
	
	return false;
}

DBot.IsAskingMe_Command = function(msg) {
	if (msg.content.substr(0, DBot.aidcLen) == DBot.askIdC)
		return true;
	
	var prefix = '}';
	
	if (!DBot.IsPM(msg)) {
		if (cvars.Server(msg.channel.guild).getVar('prefix_disable').getBool())
			return false;
		
		if (cvars.Channel(msg.channel).getVar('prefix_disable').getBool())
			return false;
		
		let sPrefix = cvars.Server(msg.channel.guild).getVar('prefix').getString();
		let cPrefix = cvars.Channel(msg.channel).getVar('prefix').getString();
		
		if (cPrefix != '')
			prefix = cPrefix;
		else
			prefix = sPrefix;
	}
	
	if (msg.content.substr(0, 1) == prefix)
		return true;
	
	return false;
}

DBot.IdentifyCommand = function(msg) {
	let rawmessage = msg.content;
	let isPrivate = DBot.IsPM(msg);
	
	if (rawmessage == '') {
		return false;
	}
	
	let splitted = DBot.TrimArray(rawmessage.split(' '));
	
	let prefix = '}';
	
	if (!isPrivate) {
		let sPrefix = cvars.Server(msg.channel.guild).getVar('prefix').getString();
		let cPrefix = cvars.Channel(msg.channel).getVar('prefix').getString();
		
		if (cPrefix != '')
			prefix = cPrefix;
		else
			prefix = sPrefix;
	}
	
	if (rawmessage.substr(0, prefix.length) == prefix) {
		let recreate = [];
		recreate.push(prefix);
		
		splitted[0] = splitted[0].substr(prefix.length);
		
		for (let i in splitted) {
			recreate.push(splitted[i]);
		}
		
		splitted = recreate;
	}
	
	let rawCommand = splitted[1];
	
	if (!rawCommand)
		return false;
	
	let command = rawCommand.toLowerCase();
	
	/*
		splitted[shift - 1] = Our ID
		splitted[shift] = Command
		splitted[...] = arguments
	*/
	
	if (!DBot.Commands[command]) {
		return false;
	}
	
	let cCommand = DBot.Commands[command];
	return cCommand.id;
}

DBot.HandleMessage = function(msg, isPrivate, test) {
	let shift = 1;
	
	if (isPrivate)
		shift = 0;
	
	let rawmessage = msg.content;
	
	if (rawmessage == '') {
		if (test)
			return false;
		
		if (isPrivate) {
			if (msg.attachments) {
				msg.reply('Oh! A Picture x3');
			}
		}
		
		return;
	}
	
	let splitted = DBot.TrimArray(rawmessage.split(' '));
	
	let ServerBans;
	let ChannelBans;
	let MemberBans;
	let prefix = '}';
	
	if (!isPrivate) {
		ServerBans = DBot.ServerCBans(msg.channel.guild);
		ChannelBans = DBot.ChannelCBans(msg.channel);
		MemberBans = DBot.MemberCBans(msg.member);
		
		let sPrefix = cvars.Server(msg.channel.guild).getVar('prefix').getString();
		let cPrefix = cvars.Channel(msg.channel).getVar('prefix').getString();
		
		if (cPrefix != '')
			prefix = cPrefix;
		else
			prefix = sPrefix;
		
	}
	
	if (rawmessage.substr(0, prefix.length) == prefix) {
		if (isPrivate) {
			if (test)
				return false;
			
			msg.reply('Oh, you don\'t need } in PM messages x3\nTry without }');
			return;
		}
		
		let recreate = [];
		recreate.push(prefix);
		
		splitted[0] = splitted[0].substr(prefix.length);
		
		for (let i in splitted) {
			recreate.push(splitted[i]);
		}
		
		splitted = recreate;
	}
	
	let rawCommand = splitted[shift];
	
	if (!rawCommand)
		return false;
	
	let command = rawCommand.toLowerCase();
	
	/*
		splitted[shift - 1] = Our ID
		splitted[shift] = Command
		splitted[...] = arguments
	*/
	
	let can = hook.Run('CanExecuteCommand', msg.author, command, msg);
	
	if (can === false)
		return false;
	
	if (!DBot.Commands[command]) {
		if (test)
			return false;
		else {
			if (msg.channel.cooldown && msg.channel.cooldown > CurTime()) {
				msg.channel.cooldown = CurTime() + 1;
				return;
			}
			
			msg.channel.cooldown = CurTime() + 1;
		}
		
		let output = 'I don\'t know what to do with that :\\';
		let related = findRelated(command);
		
		if (related[0] && related[0][1] > 1) {
			output += '\nMaybe you mean `' + related[0][0] + '`?';
		}
		
		msg.reply(output);
		return;
	}
	
	let cCommand = DBot.Commands[command];
	
	let can2 = hook.Run('CanExecuteValidCommand', msg.author, cCommand.id, msg);
	
	if (can2 === false)
		return false;
	
	if (ServerBans && ServerBans.isBanned(cCommand.id)) {
		if (test)
			return false;
		
		msg.reply('Command is banned on entrie server ;w;');
		return;
	}
	
	if (ChannelBans && ChannelBans.isBanned(cCommand.id)) {
		if (test)
			return false;
		
		msg.reply('Command is banned on this channel ;w;');
		return;
	}
	
	if (ServerBans && ServerBans.isBanned(cCommand.name)) {
		if (test)
			return false;
		
		msg.reply('Command is banned on entrie server ;w;');
		return;
	}
	
	if (ChannelBans && ChannelBans.isBanned(cCommand.name)) {
		if (test)
			return false;
		
		msg.reply('Command is banned on this channel ;w;');
		return;
	}
	
	if (test)
		return true;
	
	let rawcmd = '';
	let first = true;
	
	for (let i = 1 + shift; i < splitted.length; i++) {
		if (splitted[i] == '')
			continue;
		
		if (first) {
			rawcmd = splitted[i];
			first = false;
		} else {
			rawcmd += ' ' + splitted[i];
		}
	}
	
	let parsedData = DBot.ParseString(rawcmd);
	let parsedArgs = parsedData[0];
	let parsedHandlers = parsedData[1];
	
	let redoneCmd = '';
	let firstRedone = true;
	
	for (let i in parsedArgs) {
		if (firstRedone) {
			redoneCmd = parsedArgs[i];
			firstRedone = false;
		} else {
			redoneCmd += ' ' + parsedArgs[i];
		}
	}
	
	DBot.ExecuteCommand(cCommand, msg, parsedArgs, redoneCmd, command, null, parsedHandlers);
}
