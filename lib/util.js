
var crypto = require('crypto');

UnixStamp = function() {
	return (new Date()).getTime();
}

DBot.Random = function(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

DBot.RandomArray = function(arr) {
	return arr[DBot.Random(0, arr.length - 1)];
}

DBot.HashString = function(str) {
	return crypto.createHash('sha256').update(str).digest('hex');
}

DBot.HashString5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

DBot.HashString1 = function(str) {
	return crypto.createHash('sha1').update(str).digest('hex');
}

DBot.HashString512 = function(str) {
	return crypto.createHash('sha512').update(str).digest('hex');
}

DBot.IsMyMessage = function(msg) {
	return msg.author.id == DBot.bot.user.id;
}

DBot.IsPM = function(msg) {
	return msg.channel.type == 'dm';
}

DBot.MessageByServerOwner = function(msg) {
	if (DBot.IsPM(msg))
		return false;
	
	return msg.author.id == msg.channel.guild.ownerID;
}

DBot.MessageByDBot = function(msg) {
	return msg.author.id == '141004095145115648';
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
	
	hook.Run('BotOnline', DBot.bot);
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

DBot.GetNotificationChannel = function(server) {
	var get;
	
	server.channels.array().forEach(function(channel) {
		if (get)
			return;
		
		if (channel.name == 'shitposting' || channel.name == 'general' || channel.name == 'notification' || channel.name == 'main' || channel.id == server.id)
			get = channel;
	});
	
	return get;
}

DBot.HaveValue = function(arr, val) {
	for (var i in arr) {
		if (arr[i] == val)
			return true;
	}
	
	return false;
}

DBot.HasValue = DBot.HaveValue

DBot.FormatAsk = function(user) {
	return '<@' + user.id + '>, ';
}

DBot.UserIsGarbage = function(userID) {
	var users = DBot.client.users.array();
	
	for (var k in users) {
		if (users[k].id == userID)
			return false;
	}
	
	// ???
	
	var servers = DBot.client.guilds.array();
	
	for (var i in servers) {
		var members = servers[i].members.array()
		
		for (var k in members) {
			if (members[k].id == userID)
				return false;
		}
	}
	
	return true;
}

DBot.RefreshData = function() {
	hook.Run('Refresh');
}

var WorkingMessages = [
	'jumping',
	'spinning around',
	'jumping on your table',
	'getting hugs',
	'booping your nose',
	'hugging you',
	'licking your face',
	'nomming your nose',
];

var PrefixMessages = [
	'Please wait, i am ',
	'Stay here and wait, i am ',
	'Hold on, i am ',
	'Wait, i am ',
	'Weee, it is so fun! I am ',
	'Wait, Watch me how i am ',
];

DBot.GenerateWaitMessage = function() {
	return DBot.RandomArray(PrefixMessages) + DBot.RandomArray(WorkingMessages);
}
