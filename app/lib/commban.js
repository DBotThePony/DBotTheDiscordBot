
DBot.commBanCache = {};
var cache = DBot.commBanCache;
cache.server = {};
cache.channel = {};
cache.member = {};
var MySQL = DBot.MySQL;

DBot.DisallowCommandManipulate = [
	'invite', 'cban', 'ucban',
	'cuban', 'help', 'clist'
];

class CommandBanClass {
	onBanned(command) {
		if (!this.ready)
			return;
		
		MySQL.query('INSERT INTO command_bans_' + this.realm + ' ("UID", "COMMAND") VALUES (' + this.uid + ', \'' + command + '\')');
	}
	
	onUnBanned(command) {
		if (!this.ready)
			return;
		
		MySQL.query('DELETE FROM command_bans_' + this.realm + ' WHERE "UID" = ' + this.uid + ' AND "COMMAND" = \'' + command + '\'');
	}
	
	addCommand(command) {
		if (DBot.HaveValue(this.bans, command))
			return false;
		
		this.bans.push(command);
		this.onBanned(command);
		return true;
	}
	
	banCommand(command) {
		return this.addCommand(command);
	}
	
	ban(command) {
		return this.addCommand(command);
	}
	
	removeCommand(command) {
		for (var i in this.bans) {
			if (this.bans[i] == command) {
				this.bans.splice(i, 1);
				this.onUnBanned(command);
				return true;
			}
		}
		
		return false;
	}
	
	deleteTag(command) {
		return this.removeCommand(command);
	}
	
	unBanTag(command) {
		return this.removeCommand(command);
	}
	
	unBan(command) {
		return this.removeCommand(command);
	}
	
	isBanned(command) {
		return DBot.HaveValue(this.bans, command.toLowerCase());
	}
	
	bannedTags() {
		return this.bans;
	}
	
	getBannedTags() {
		return this.bans;
	}
	
	constructor(obj, realm, IDFunc) {
		this.bans = [];
		this.obj = obj;
		this.realm = realm;
		this.ready = false;
		this.uid = IDFunc(obj);
		var Me = this;
		
		MySQL.query('SELECT "COMMAND" FROM command_bans_' + this.realm + ' WHERE "UID" = ' + this.uid, function(err, data) {
			for (var i in data) {
				Me.ban(data[i].COMMAND);
			}
			
			Me.ready = true;
			hook.Run('CommandBansInitialized', obj, Me);
		});
	}
}

DBot.ServerCBans = function(server) {
	if (cache.server[server.id])
		return cache.server[server.id];
	
	cache.server[server.id] = new CommandBanClass(server, 'server', DBot.GetServerID);
	return cache.server[server.id];
}

DBot.ChannelCBans = function(channel) {
	if (cache.channel[channel.id])
		return cache.channel[channel.id];
	
	cache.channel[channel.id] = new CommandBanClass(channel, 'channel', DBot.GetChannelID);
	return cache.channel[channel.id];
}

DBot.MemberCBans = function(member) {
	cache.member[member.id] = cache.member[member.id] || {};
	
	if (cache.member[member.id][member.guild.id])
		return cache.member[member.id][member.guild.id];
	
	cache.member[member.id][member.guild.id] = new CommandBanClass(member, 'member', DBot.GetMemberID);
	return cache.member[member.id][member.guild.id];
}

hook.Add('PreDeleteChannel', 'ChannelBans', function(obj) {
	cache.channel[obj.id] = undefined;
});

hook.Add('PreDeleteServer', 'ServerBans', function(obj) {
	cache.server[obj.id] = undefined;
});

hook.Add('ServerInitialized', 'ServerBans', function(obj) {
	DBot.ServerCBans(obj);
});

hook.Add('ChannelInitialized', 'ChannelBans', function(obj) {
	DBot.ChannelCBans(obj);
});

hook.Add('MemberInitialized', 'MemberCommandBans', function(obj) {
	DBot.MemberCBans(obj);
	
	obj.channelBans = obj.channelBans || [];
	
	
	Postgres.query('SELECT * FROM command_banned_cmember WHERE "UID" = ' + obj.uid, function(err, data) {
		for (let row of data) {
			obj.channelBans.push(Number(row.CHANNEL));
		}
	});
	
	Postgres.query('SELECT * FROM command_banned_member WHERE "UID" = ' + obj.uid, function(err, data) {
		if (data && data[0]) {
			obj.totalMute = true;
		}
	});
	
	obj.unMuteBot = function() {
		this.totalMute = false;
		
		Postgres.query('DELETE FROM command_banned_member WHERE "UID" = ' + this.uid);
	}
	
	obj.muteBot = function() {
		if (this.totalMute)
			return false;
		
		this.totalMute = true;
		
		Postgres.query('INSERT INTO command_banned_member VALUES (' + this.uid + ')');
		return true;
	}
	
	obj.checkBotMute = function(channel) {
		if (this.totalMute)
			return true;
		
		if (this.channelBans.includes(DBot.GetChannelID(channel)))
			return true;
		
		return false;
	}
	
	obj.unMuteChannel = function(channel) {
		let uid = DBot.GetChannelID(channel);
		let hit = false;
		
		for (let i in this.channelBans) {
			if (this.channelBans[i] == uid) {
				this.channelBans = this.channelBans.splice(i, 1);
				hit = true;
				break;
			}
		}
		
		if (!hit)
			return false;
		
		Postgres.query('DELETE FROM command_banned_cmember WHERE "UID" = ' + this.uid + ' AND "CHANNEL" = ' + DBot.GetChannelID(channel));
		
		return true;
	}
	
	obj.muteChannel = function(channel) {
		let uid = DBot.GetChannelID(channel);
		
		if (this.channelBans.includes(uid))
			return false;
		
		Postgres.query('INSERT INTO command_banned_cmember VALUES (' + this.uid + ', ' + uid + ')');
		this.channelBans.push(uid);
		
		return true;
	}
});

let disallow = [
	'mute', 'unmute', 'cmute', 'cunmute'
];

hook.Add('CanExecuteValidCommand', 'MemberCommandBans', function(user, command, msg) {
	if (DBot.IsPM(msg))
		return;
	
	if (disallow.includes(command))
		return;
	
	let member = msg.member;
	let cid = DBot.GetChannelID(msg.channel);
	
	if (member.totalMute)
		return false;
	
	if (member.channelBans.includes(cid))
		return false;
});

hook.Add('CanReply', 'MemberCommandBans', function(msg) {
	if (DBot.IsPM(msg))
		return;
	
	let member = msg.member;
	let cid = DBot.GetChannelID(msg.channel);
	
	if (member.totalMute)
		return false;
	
	if (member.channelBans.includes(cid))
		return false;
});

hook.Add('ClientLeftServer', 'MemberCommandBans', function(obj) {
	cache.member[obj.id] = cache.member[obj.id] || {};
	cache.member[obj.id][obj.guild.id] = undefined;
});
