
Util.SafeCopy('./resource/files/messages.css', DBot.WebRoot + '/messages.css');
Util.mkdir(DBot.WebRoot + '/messages');

var crypto = require('crypto');
var fs = require('fs');

var stuff1 = "<!DOCTYPE HTML>\
<html>\
<head>\
<link rel='stylesheet' href='../messages.css' type='text/css' />\
<title>Message report</title>\
</head>\
<body>\
<span id='wrapper'>";

var replaceUserNamesFunc = function(matched, p1) {
	var find = DBot.TryFindUser(p1);
	
	if (find)
		return '@' + find.username;
	else
		return '@' + p1;
}

var replaceChannelsNamesFunc = function(matched, p1) {
	var find = DBot.FindChannel(p1);
	
	if (find)
		return '#' + find.name;
	else
		return '#' + p1;
}

module.exports = {
	name: 'messages',
	
	help_args: '<@user or text>',
	desc: 'If user is specified, finds messages related to specified user, in other case matches messages.\nYou can use Regular Expressions',
	
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!args[0]) {
			return 'There must be user or text ;w;' + Util.HighlightHelp(['messages'], 2, args);
		}
		
		var messages = msg.channel.messages.array();
		
		var continueFunc = function() {
			messages = msg.channel.messages.array();
			var valid = [];
			
			if (typeof args[0] == 'object') {
				// Search by user
				
				for (let i in messages) {
					let message = messages[i];
					
					if (message.author.id == args[0].id)
						valid.push(message);
				}
			} else {
				try {
					var regExp = new RegExp(args[0]);
				} catch(err) {
					msg.reply('Invalid regular expression:\n```' + err + '```');
					return;
				}
				
				for (let i in messages) {
					let message = messages[i];
					
					if (message.content.match(regExp))
						valid.push(message);
				}
			}
			
			if (!valid[0]) {
				msg.reply('None of messages found');
				return;
			}
			
			var hash = crypto.createHash('sha256');
			
			hash.update(msg.channel.guild.id);
			hash.update(msg.channel.id);
			
			for (let i in valid) {
				let message = valid[i];
				
				hash.update(message.id);
			}
			
			var sha = hash.digest('hex');
			
			var fpath = DBot.WebRoot + '/messages/' + sha + '.html';
			
			fs.stat(fpath, function(err, stat) {
				if (stat) {
					msg.reply(DBot.URLRoot + '/messages/' + sha + '.html');
				} else {
					var stream = fs.createWriteStream(fpath);
					stream.write(stuff1);
					stream.write("<span id='total'>Total messages: " + valid.length + '</span>');
					
					for (let i in valid) {
						let message = valid[i];
						
						stream.write("<span class='message_entry'>\
<img src='" + (message.author.avatarURL || '../discord.png') + "' class='user_avatar' />\
<span class='username'>" + message.author.username + "<span class='messagetime'>" + message.createdAt.toString() + "</span><span class='userid'>&lt;@" + message.author.id + "&gt;</span></span>\
<span class='text'>" + Util.ParseMarkdown(message.content.replace(/<@([0-9]+)>/gi, replaceUserNamesFunc).replace(/<#([0-9]+)>/gi, replaceChannelsNamesFunc)) + "</span>\
</span>");
					}
					
					stream.write('</span></body></html>');
					stream.end();
					
					stream.on('finish', function() {
						msg.reply(DBot.URLRoot + '/messages/' + sha + '.html');
					});
				}
			});
		}
		
		if (messages.length > 200) {
			continueFunc();
		} else {
			let newMsg;
			let del = false;
			
			msg.reply('Fetching messages, this can take a while...').then(function(nnnnnn) {
				newMsg = nnnnnn;
				
				if (del) {
					newMsg.delete(0);
				}
			});
			
			let Target = 500;
			let LastTarget = 0;
			
			var loop = function(lim) {
				msg.channel.fetchMessages({limit: Math.min(100, Target - messages.length)})
				.then(function(list) {
					messages = msg.channel.messages.array();
					
					if (LastTarget == Target - messages.length) {
						if (newMsg)
							newMsg.delete(0);
						
						del = true;
						
						continueFunc();
						return;
					}
					
					LastTarget = Target - messages.length;
					if (messages.length >= Target) {
						if (newMsg)
							newMsg.delete(0);
						
						del = true;
						
						continueFunc();
					} else {
						setTimeout(loop, 1000);
					}
				})
				.catch(function(err) {
					if (newMsg)
						newMsg.delete(0);
					
					del = true;
					
					console.log(err);
					msg.reply('Unable to fetch messages...');
				});
			}
			
			loop();
		}
	},
}
