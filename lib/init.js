
DBot = {};
DBot.fs = require('fs');
var crypto = require('crypto');

UnixStamp = function() {
	return (new Date()).getTime();
}

require('./mysql.js');
require('./handler.js');
require('./modules/hook.js');

require('./commands.js');

DBot.Random = function(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

DBot.HashString = function(str) {
	return crypto.createHash('sha256').update(str).digest('hex');
}

DBot.IsMyMessage = function(msg) {
	return msg.author.id == DBot.bot.user.id;
}

DBot.IsPM = function(msg) {
	return msg.channel.type == 'dm';
}

DBot.ConcatArray = function(arr, sep) {
	sep = sep || '';
	var first = true;
	var out = '';
	
	arr.forEach(function(item) {
		if (first) {
			first = false;
			out = item;
		} else {
			out += sep + item;
		}
	});
	
	return out;
}

DBot.InitVars = function() {
	DBot.id = DBot.bot.user.id;
	console.log('Bot ID: ' + DBot.id);
	DBot.askId = '<@' + DBot.bot.user.id + '>';
	DBot.askIdC = '<@' + DBot.bot.user.id + '> ';
	
	DBot.idLen = DBot.id.length;
	DBot.aidLen = DBot.askId.length;
	DBot.aidcLen = DBot.askIdC.length;
}

DBot.IsAskingMe = function(msg) {
	if (msg.content.substr(0, DBot.aidLen) == DBot.askId)
		return true;
	
	return false;
}

DBot.IsAskingMe_Command = function(msg) {
	if (msg.content.substr(0, DBot.aidcLen) == DBot.askIdC)
		return true;
	
	return false;
}
