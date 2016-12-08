
DBot.tags = {};
DBot.tagCache = {};
var cache = DBot.tagCache;
var MySQL = DBot.MySQL;

cache.server = {};
cache.client = {};
cache.channel = {};

DBot.CreateTagsSpace = function(space, defBans) {
	DBot.tags[space] = {
		bans: defBans || [],
		name: space,
	}
	
	DBot.tagCache.server[space] = {};
	DBot.tagCache.client[space] = {};
	DBot.tagCache.channel[space] = {};
	
	MySQL.query('CREATE TABLE IF NOT EXISTS "tags__' + space + '_client_init" (UID INTEGER NOT NULL)');
	MySQL.query('CREATE TABLE IF NOT EXISTS "tags__' + space + '_client" (UID INTEGER NOT NULL, TAG VARCHAR(64) NOT NULL)');
	
	MySQL.query('CREATE TABLE IF NOT EXISTS "tags__' + space + '_server_init" (UID INTEGER NOT NULL)');
	MySQL.query('CREATE TABLE IF NOT EXISTS "tags__' + space + '_server" (UID INTEGER NOT NULL, TAG VARCHAR(64) NOT NULL)');
	
	MySQL.query('CREATE TABLE IF NOT EXISTS "tags__' + space + '_channel_init" (UID INTEGER NOT NULL)');
	MySQL.query('CREATE TABLE IF NOT EXISTS "tags__' + space + '_channel" (UID INTEGER NOT NULL, TAG VARCHAR(64) NOT NULL)');
}

class TagBase {
	onBanned(tag) {
		if (!this.ready)
			return;
		
		MySQL.query('INSERT INTO tags__' + this.space + '_' + this.realm + ' (UID, TAG) VALUES (' + Util.escape(this.uid) + ', ' + Util.escape(tag) + ')');
	}
	
	onUnBanned(tag) {
		if (!this.ready)
			return;
		
		MySQL.query('DELETE FROM tags__' + this.space + '_' + this.realm + ' WHERE UID = ' + Util.escape(this.uid) + ' AND TAG = ' + Util.escape(tag) + '');
	}
	
	addTag(tag) {
		if (DBot.HaveValue(this.bans, tag))
			return false;
		
		this.bans.push(tag);
		this.onBanned(tag);
		return true;
	}
	
	banTag(tag) {
		return this.addTag(tag);
	}
	
	removeTag(tag) {
		for (var i in this.bans) {
			if (this.bans[i] == tag) {
				this.bans.splice(i, 1);
				this.onUnBanned(tag);
				return true;
			}
		}
		
		return false;
	}
	
	deleteTag(tag) {
		return this.removeTag(tag);
	}
	
	unBanTag(tag) {
		return this.removeTag(tag);
	}
	
	unBan(tag) {
		return this.removeTag(tag);
	}
	
	isBanned(tag) {
		return DBot.HaveValue(this.bans, tag.toLowerCase());
	}
	
	bannedTags() {
		return this.bans;
	}
	
	getBannedTags() {
		return this.bans;
	}
	
	reset() {
		var Me = this;
		
		MySQL.query('DELETE FROM tags__' + this.space + '_' + this.realm + ' WHERE UID = ' + Util.escape(this.uid), function(err, data) {
			Me.bans = [];
			var bans = Me.defBans;
			
			for (var i in bans) {
				Me.banTag(bans[i]);
			}
		});
	}
	
	constructor(obj, space, realm, IDFunc) {
		this.bans = [];
		this.obj = obj;
		this.realm = realm;
		this.ready = false;
		this.uid = IDFunc(obj);
		this.space = space;
		
		this.defBans = DBot.tags[this.space].bans;
		
		var query = 'SELECT UID FROM tags__' + this.space + '_' + this.realm + '_init WHERE UID = ' + Util.escape(this.uid);
		
		var Me = this;
		
		MySQL.query(query, function(err, data) {
			if (!data[0]) {
				Me.ready = true;
				var bans = Me.defBans;
				
				for (var i in bans) {
					Me.banTag(bans[i]);
				}
				
				hook.Run('TagsInitialized', Me.realm, obj, Me.space, Me);
				MySQL.query('INSERT INTO tags__' + Me.space + '_' + Me.realm + '_init (UID) VALUES (' + Util.escape(Me.uid) + ')');
			} else {
				MySQL.query('SELECT TAG FROM tags__' + Me.space + '_' + Me.realm + ' WHERE UID = ' + Util.escape(Me.uid), function(err, data) {
					for (var i in data) {
						Me.banTag(data[i].TAG);
					}
					
					Me.ready = true;
					hook.Run('TagsInitialized', Me.realm, obj, Me.space, Me);
				});
			}
		});
	}
}

DBot.UserTags = function(user, space) {
	if (cache.client[space][user.id])
		return cache.client[space][user.id];
	
	cache.client[space][user.id] = new TagBase(user, space, 'client', DBot.GetUserID);
	return cache.client[space][user.id];
}

DBot.ServerTags = function(server, space) {
	if (cache.server[space][server.id])
		return cache.server[space][server.id];
	
	cache.server[space][server.id] = new TagBase(server, space, 'server', DBot.GetServerID);
	return cache.server[space][server.id];
}

DBot.ChannelTags = function(channel, space) {
	if (cache.channel[space][channel.id])
		return cache.channel[space][channel.id];
	
	cache.channel[space][channel.id] = new TagBase(channel, space, 'channel', DBot.GetChannelID);
	return cache.channel[space][channel.id];
}

DBot.ValidTagSpaces = function() {
	var output;
	
	for (var k in DBot.tags) {
		if (output)
			output += ', ' + k;
		else
			output = String(k);
	}
	
	return output;
}

DBot.UnloadUserTags = function(user, space) {
	cache.client[space][user.id] = undefined;
}

DBot.UnloadServerTags = function(server, space) {
	cache.server[space][server.id] = undefined;
}

DBot.UnloadChannelTags = function(channel, space) {
	cache.channel[space][channel.id] = undefined;
}

hook.Add('PreDeleteUser', 'UserTags', function(obj) {
	for (var i in DBot.tags) {
		DBot.UnloadUserTags(obj, i);
	}
});

hook.Add('PreDeleteChannel', 'ChannelTags', function(obj) {
	for (var i in DBot.tags) {
		DBot.UnloadChannelTags(obj, i);
	}
});

hook.Add('PreDeleteServer', 'ServerTags', function(obj) {
	for (var i in DBot.tags) {
		DBot.UnloadServerTags(obj, i);
	}
});

hook.Add('UserInitialized', 'UserTags', function(obj) {
	for (var i in DBot.tags) {
		DBot.UserTags(obj, i);
	}
});

hook.Add('ServerInitialized', 'ServerTags', function(obj) {
	for (var i in DBot.tags) {
		DBot.ServerTags(obj, i);
	}
});

hook.Add('ChannelInitialized', 'ChannelTags', function(obj) {
	for (var i in DBot.tags) {
		DBot.ChannelTags(obj, i);
	}
});
