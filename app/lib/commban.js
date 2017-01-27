
DBot.commBanCache = {};
let cache = DBot.commBanCache;
cache.server = {};
cache.channel = {};
cache.member = {};

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
		for (let i in this.bans) {
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
	
	constructor(obj, realm, IDFunc, noFetch) {
		this.bans = [];
		this.obj = obj;
		this.realm = realm;
		this.ready = false;
		this.uid = IDFunc(obj);
		let Me = this;
		
		if (noFetch)
			return;
		
		MySQL.query('SELECT "COMMAND" FROM command_bans_' + this.realm + ' WHERE "UID" = ' + this.uid, function(err, data) {
			for (let i in data) {
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
	if (cache.member[member.uid])
		return cache.member[member.uid];
	
	cache.member[member.uid] = new CommandBanClass(member, 'member', DBot.GetMemberID);
	return cache.member[member.uid];
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

let init = false;
let initCount = 3;

let addMethods = function(obj) {
	obj.channelBans = obj.channelBans || [];
	
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
	
	return obj;
}

hook.Add('MemberInitialized', 'MemberCommandBans', function(obj) {
	addMethods(obj);
	
	if (!init)
		return;
	
	DBot.MemberCBans(obj);
	
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
});

hook.Add('MembersInitialized', 'MemberCommandBans', function() {
	Postgres.query('SELECT command_banned_cmember."UID", command_banned_cmember."CHANNEL" FROM command_banned_cmember, users WHERE users."TIME" > currtime() - 120 AND command_banned_cmember."UID" = users."ID"', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			let get = DBot.GetMember(row.UID);
			
			if (!get)
				continue;
			
			get.channelBans.push(Number(row.CHANNEL));
		}
		
		initCount--;
		init = initCount == 0;
	});
	
	Postgres.query('SELECT command_banned_member."UID" FROM command_banned_member, users WHERE users."TIME" > currtime() - 120 AND command_banned_member."UID" = users."ID"', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			let get = DBot.GetMember(row.UID);
			
			if (!get)
				continue;
			
			get.totalMute = true;
		}
		
		initCount--;
		init = initCount == 0;
	});
	
	Postgres.query('SELECT command_bans_member."UID", command_bans_member."COMMAND" FROM command_bans_member, users WHERE users."TIME" > currtime() - 120 AND command_bans_member."UID" = users."ID"', function(err, data) {
		if (err) throw err;
		
		for (let row of data) {
			if (!DBot.GetMember(row.UID))
				continue;
			
			cache.member[row.UID] = cache.member[row.UID] || new CommandBanClass(DBot.GetMember(row.UID), 'member', DBot.GetMemberID, true);
			cache.member[row.UID].ready = false;
			cache.member[row.UID].ban(row.COMMAND);
		}
		
		for (let i in cache.member) {
			cache.member[i].ready = true;
		}
		
		initCount--;
		init = initCount == 0;
	});
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
