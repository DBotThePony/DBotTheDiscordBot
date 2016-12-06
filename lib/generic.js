
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

cvars.ServerVar('notify_channel', '', [FCVAR_CHANNELONLY], 'Channel to threat as notifications channel');

DBot.GetNotificationChannel = function(server) {
	var get = cvars.Server(server).getVar('notify_channel').getChannel();
	
	if (get)
		return get;
	
	var channels = server.channels.array();
	
	for (let channel of channels) {
		if (channel.name.match('shitposting') || channel.name == 'notifications' || channel.name == 'notification') {
			get = channel;
			break;
		}
	}
	
	return get || server.defaultChannel;
}

DBot.HaveValue = function(arr, val) {
	for (let vl of arr) {
		if (vl == val)
			return true;
	}
	
	return false;
}

DBot.HasValue = DBot.HaveValue;

DBot.FormatAsk = function(user) {
	return '<@' + user.id + '>, ';
}

DBot.UserIsGarbage = function(userID) {
	var users = DBot.client.users.array();
	
	for (let k in users) {
		if (users[k].id == userID)
			return false;
	}
	
	// ???
	
	let servers = DBot.client.guilds.array();
	
	for (let server of servers) {
		let members = server.members.array();
		
		for (let member of members) {
			if (member.id == userID)
				return false;
		}
	}
	
	return true;
}

DBot.GetUsers = function() {
	var output = {};
	var reply = [];
	
	var servers = DBot.client.guilds.array();
	
	for (let server of servers) {
		let members = server.members.array();
		
		for (let member of members) {
			let user = member.user;
			
			if (!output[user.id]) {
				output[user.id] = user;
			}
		}
	}
	
	for (let k in output) {
		reply.push(output[k]);
	}
	
	return reply;
}

DBot.RefreshData = function() {
	hook.Run('Refresh');
}

DBot.TryFindUser = function(uid) {
	var users = DBot.client.users.array();
	
	for (let k of users) {
		if (k.id == uid)
			return k;
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

const unirest = require('unirest');
const URL = require('url');

const expr = new RegExp('^https?://' + DBot.URLRootBare + '/(.*)');
const cover = new RegExp('\\.\\./', 'gi');

DBot.LoadImageURL = function(url, callback, callbackError) {
	let hash = DBot.HashString(url);
	let uObj = URL.parse(url);
	let path = uObj.pathname;
	let split = path.split('.');
	let ext = split[split.length - 1];
	let match = url.match(expr);

	let fPath = DBot.WebRoot + '/img_cache/' + hash + '.' + ext;
	
	if (match && !url.match(cover)) {
		fPath = DBot.WebRoot + '/' + match[1];
	}
	
	fs.stat(fPath, function(err, stat) {
		if (stat && stat.isFile()) {
			callback(fPath);
		} else {
			unirest.get(url)
			.encoding(null)
			.end(function(result) {
				let body = result.raw_body;
				
				if (!body) {
					if (callbackError) {
						try {
							callbackError(result);
						} catch(err) {
							console.error(err);
						}
					}
					
					return;
				}
				
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

DBot.CommandError = function(message, name, args, argID) {
	return message + '\n' + Util.HighlightHelp([name], 1 + argID, args) + 'Help:\n```' + DBot.BuildHelpStringForCommand(name) + '```\n';
}
