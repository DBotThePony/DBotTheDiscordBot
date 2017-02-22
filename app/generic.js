
/* global DBot, cvars, FCVAR_CHANNELONLY, hook, Util, CommandHelper */

Util.SafeCopy('./node_modules/moment/moment.js', DBot.WebRoot + '/moment.js');
Util.SafeCopy('./node_modules/numeral/numeral.js', DBot.WebRoot + '/numeral.js');
Util.SafeCopy('./resource/files/jquery-3.0.0.min.js', DBot.WebRoot + '/jquery-3.0.0.min.js');
Util.SafeCopy('./resource/files/noavatar.jpg', DBot.WebRoot + '/no_avatar.jpg');

const crypto = DBot.js.crypto;
const fs = DBot.js.fs;

for (const file of fs.readdirSync('./app/webroot')) {
	Util.Copy('./app/webroot/' + file, DBot.WebRoot + '/' + file);
}

Util.mkdir(DBot.WebRoot + '/fonts', function() {
	for (const file of fs.readdirSync('./resource/webfonts')) {
		Util.SafeCopy('./resource/webfonts/' + file, DBot.WebRoot + '/fonts/' + file);
	}
});

global.UnixStamp = function() {
	return (new Date()).getTime() / 1000;
};

global.CurTime = global.UnixStamp;
global.Systime = global.UnixStamp;
global.RealTime = global.UnixStamp;

let cooldown = 0;
let statusTimerID;
let lastRequestedStatus;

DBot.Status = function(newStatus) {
	if (cooldown > CurTime()) {
		if (statusTimerID) {
			lastRequestedStatus = newStatus;
			return;
		};
		
		lastRequestedStatus = newStatus;
		
		statusTimerID = setTimeout(function() {
			DBot.bot.user.setGame(lastRequestedStatus);
			statusTimerID = null;
		}, 10000);
		return;
	}
	
	cooldown = CurTime() + 10;
	
	DBot.bot.user.setGame(newStatus);
};

DBot.pugRender = function(path, data) {
	try {
		return DBot.js.pug.renderFile('./app/templates/' + path, data);
	} catch(err) {
		console.error(err);
		return '';
	}
};

DBot.IsMyMessage = function(msg) {
	return msg.author.id === DBot.bot.user.id;
};

DBot.IsPM = function(msg) {
	return msg.channel.type === 'dm';
};

DBot.InitVars = function() {
	DBot.id = DBot.bot.user.id;
	DBot.askId = '<@' + DBot.bot.user.id + '>';
	DBot.askIdC = '<@' + DBot.bot.user.id + '> ';
	DBot.askId2 = '<@!' + DBot.bot.user.id + '>';
	DBot.askIdC2 = '<@!' + DBot.bot.user.id + '> ';
	
	DBot.idLen = DBot.id.length;
	DBot.aidLen = DBot.askId.length;
	DBot.aidcLen = DBot.askIdC.length;
	DBot.aidLen2 = DBot.askId2.length;
	DBot.aidcLen2 = DBot.askIdC2.length;
};

cvars.ServerVar('notify_channel', '', [FCVAR_CHANNELONLY], 'Channel to threat as notifications channel');

DBot.GetNotificationChannel = function(server) {
	let get = cvars.Server(server).getVar('notify_channel').getChannel();
	
	if (get)
		return get;
	
	let channels = server.channels.array();
	
	for (let channel of channels) {
		if (channel.name.match('shitposting') || channel.name === 'notifications' || channel.name === 'notification') {
			get = channel;
			break;
		}
	}
	
	return get || server.defaultChannel;
};

DBot.HaveValue = function(arr, val) {
	for (let vl of arr) {
		if (vl === val)
			return true;
	}
	
	return false;
};

DBot.HasValue = DBot.HaveValue;

DBot.FormatAsk = function(user) {
	return '<@' + user.id + '>, ';
};

DBot.UserIsGarbage = function(userID) {
	let users = DBot.client.users.array();
	
	for (let k in users) {
		if (users[k].id === userID)
			return false;
	}
	
	// ???
	
	let servers = DBot.client.guilds.array();
	
	for (let server of servers) {
		let members = server.members.array();
		
		for (let member of members) {
			if (member.id === userID)
				return false;
		}
	}
	
	return true;
};

DBot.GetUsers = function() {
	let output = {};
	let reply = [];
	
	let servers = DBot.client.guilds.array();
	
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
};

DBot.GetUserServers = function(user) {
	let servers = [];
	
	for (let server of DBot.GetServers()) {
		for (let member of server.members.array()) {
			if (user.id === member.user.id) {
				servers.push(server);
			}
		}
	}
	
	return servers;
};

DBot.GetServers = function() {
	return DBot.bot.guilds.array();
};

DBot.GetChannels = function() {
	return DBot.bot.channels.array();
};

DBot.GetMembers = function() {
	let members = [];
	
	for (let server of DBot.GetServers()) {
		for (let member of server.members.array()) {
			members.push(member);
		}
	}
	
	return members;
};

DBot.RefreshData = function() {
	hook.Run('Refresh');
};

DBot.TryFindUser = function(uid) {
	let users = DBot.client.users.array();
	
	for (let k of users) {
		if (k.id === uid)
			return k;
	}
	
	return false;
};

DBot.IdentifyUser = function(str) {
	let len = str.length;
	
	if (str.substr(0, 2) !== '<@')
		return false;
	
	if (str.substr(len - 1, 1) !== '>')
		return false;
	
	if (str.substr(0, 3) !== '<@!')
		return DBot.TryFindUser(str.substr(2, len - 3));
	else
		return DBot.TryFindUser(str.substr(3, len - 4));
};

Util.mkdir(DBot.WebRoot + '/img_cache');

const unirest = require('unirest');
const URL = require('url');

DBot.LoadImageURL = function(url, callback, callbackError) {
	let hash = String.hash(url);
	let matchExt = url.match(CommandHelper.imageExtExt);
	let match = url.match(CommandHelper.urlExpression);

	let fPath = DBot.WebRoot + '/img_cache/' + hash + '.' + matchExt[1];
	
	let matchInternal = url.match(CommandHelper.internalResource);
	if (matchInternal) {
		callback(url);
		return;
	}
	
	if (match && !url.match(CommandHelper.imCover)) {
		fPath = DBot.WebRoot + '/' + match[1];
	}
	
	fs.stat(fPath, function(err, stat) {
		if (stat && stat.isFile()) {
			callback(fPath, matchExt[1]);
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
					
					callback(fPath, matchExt[1]);
				});
			});
		}
	});
};

const child_process = DBot.js.child_process;
const spawn = child_process.spawn;

DBot.EasySpawn = function(process, arguments, callback) {
	let cpu = spawn(process, arguments);
	
	Util.redirect(cpu);
	
	cpu.on('close', function(code) {
		callback(code);
	});
};

DBot.FindMeInChannel = function(channel) {
	let id = DBot.bot.user.id;
	let memb = channel.members.array();
	
	for (let i in memb) {
		let Member = memb[i];
		
		if (Member.user.id === id)
			return Member;
	}
	
	return false;
};

DBot.FindChannel = function(id) {
	let channels = DBot.bot.channels.array();
	
	for (let i in channels) {
		if (channels[i].id === id)
			return channels[i];
	}
	
	return false;
};

DBot.CommandError = function(message, name, args, argID) {
	return message + '\n' + Util.HighlightHelp([name], 1 + argID, args) + 'Help:\n```' + DBot.BuildHelpStringForCommand(name) + '```\n';
};

DBot.GetImmunityLevel = function(member) {
	if (member.user.id === member.guild.owner.user.id)
		return 9999999;
	
	let max = 0;
	
	for (let role of member.roles.array()) {
		if (role.position > max)
			max = role.position;
	}
	
	return max;
};

DBot.CanTarget = function(member_user, member_target) {
	if (DBot.owners.includes(member_user.user.id))
		return true;
	
	if (DBot.owners.includes(member_target.user.id) && member_user.user.id !== DBot.bot.user.id)
		return false;
	
	if (DBot.owners.includes(member_target.user.id) && member_user.user.id === DBot.bot.user.id)
		return true;
	
	if (member_user.user.id === member_target.user.id)
		return true;
	
	return DBot.GetImmunityLevel(member_user) > DBot.GetImmunityLevel(member_target);
};
