
var crypto = require('crypto');
var fs = require('fs');

UnixStamp = function() {
	return (new Date()).getTime() / 1000;
}

CurTime = UnixStamp;
Systime = UnixStamp;
RealTime = UnixStamp;

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

var ASSOCIATED_PERMS_TABLE = [
	['KICK_MEMBERS', 					'manipulate_kick'],
	['KICK_MEMBERS',					'manipulate'],
	
	['BAN_MEMBERS', 					'manipulate'],
	['BAN_MEMBERS', 					'manipulate_kick'],
	['BAN_MEMBERS', 					'manipulate_ban'],
	
	['ADMINISTRATOR', 					'admin_absolute'],
	
	['MANAGE_CHANNELS', 				'edit_messages'],
	['MANAGE_CHANNELS', 				'moderator'],
	
	['MANAGE_GUILD', 					'admin'],
	['MANAGE_GUILD', 					'moderator'],
	['MANAGE_MESSAGES', 				'edit_messages'],
	
	['MANAGE_NICKNAMES', 				'manipulate_nickname'],
	['MANAGE_NICKNAMES', 				'manipulate'],
	
	['MANAGE_ROLES_OR_PERMISSIONS', 	'manipulate'],
	['MANAGE_ROLES_OR_PERMISSIONS', 	'admin'],
	['MANAGE_ROLES_OR_PERMISSIONS', 	'moderator'],
	['MANAGE_ROLES_OR_PERMISSIONS', 	'edit_messages'],
	['MANAGE_ROLES_OR_PERMISSIONS', 	'manipulate_ban'],
	['MANAGE_ROLES_OR_PERMISSIONS', 	'manipulate_kick'],
];

DBot.Access = function(msg, toCheck) {
	if (DBot.IsPM(msg))
		return false;
	
	if (msg.author.id == msg.channel.guild.ownerID)
		return true;
	
	var usr = msg.member;
	
	for (var i in ASSOCIATED_PERMS_TABLE) {
		var data = ASSOCIATED_PERMS_TABLE[i];
		
		if (data[1] == toCheck) {
			if (usr.hasPermission(data[0])) {
				return true;
			}
		}
	}
	
	return false;
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
}

DBot.IsAskingMe = function(msg) {
	if (msg.content.substr(0, DBot.aidLen) == DBot.askId)
		return true;
	
	var prefix = '}';
	
	if (!DBot.IsPM(msg)) {
		if (cvars.Server(msg.channel.guild).getVar('prefix_disable').getBool())
			return false;
		
		prefix = cvars.Server(msg.channel.guild).getVar('prefix').getString();
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
		
		prefix = cvars.Server(msg.channel.guild).getVar('prefix').getString();
	}
	
	if (msg.content.substr(0, 1) == prefix)
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

DBot.TryFindUser = function(uid) {
	var users = DBot.client.users.array();
	
	for (var k in users) {
		if (users[k].id == uid)
			return users[k];
	}
	
	return false;
}

DBot.IdentifyUser = function(str) {
	var len = str.length;
	
	if (str.substr(0, 2) != '<@')
		return false;
	
	if (str.substr(len - 1, 1) != '>')
		return false;
	
	if (str.substr(0, 3) != '<@!')
		return DBot.TryFindUser(str.substr(2, len - 3));
	else
		return DBot.TryFindUser(str.substr(3, len - 4));
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

fs.stat(DBot.WebRoot + '/img_cache', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/img_cache');
});

var unirest = require('unirest');
const URL = require('url');

DBot.LoadImageURL = function(url, callback) {
	var hash = DBot.HashString(url);
	var uObj = URL.parse(url);
	var path = uObj.pathname;
	var split = path.split('.');
	var ext = split[split.length - 1];

	var fPath = DBot.WebRoot + '/img_cache/' + hash + '.' + ext;
	
	fs.stat(fPath, function(err, stat) {
		if (stat && stat.isFile()) {
			callback(fPath);
		} else {
			unirest.get(url)
			.encoding(null)
			.end(function(result) {
				var body = result.raw_body;
				
				if (!body)
					return;
				
				fs.writeFile(fPath, body, {flag: 'w'}, function(err) {
					if (err)
						return;
					
					callback(fPath);
				});
			});
		}
	});
}

const child_process = require('child_process');
const spawn = child_process.spawn;

DBot.EasySpan = function(process, arguments, callback) {
	var cpu = spawn(process, arguments);
	
	cpu.stderr.on('data', function(data) {
		console.error(data.toString());
	});
	
	cpu.stdout.on('data', function(data) {
		console.log(data.toString());
	});
	
	cpu.on('close', function(code) {
		callback(code);
	});
}

DBot.FindMeInChannel = function(channel) {
	var id = DBot.bot.user.id;
	var memb = channel.members.array();
	
	for (var i in memb) {
		var Member = memb[i];
		
		if (Member.user.id == id)
			return Member;
	}
	
	return false;
}

DBot.FindChannel = function(id) {
	var channels = DBot.bot.channels.array();
	
	for (let i in channels) {
		if (channels[i].id == id)
			return channels[i];
	}
	
	return false;
}
