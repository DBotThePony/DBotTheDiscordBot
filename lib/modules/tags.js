
DBot.tags = {};
DBot.tagCache = {};
var cache = DBot.tagCache;
var MySQL = DBot.MySQL;

DBot.CreateTagsSpace = function(space, defBans) {
	DBot.tags[space] = {
		bans: defBans || [],
		name: space,
	}
	
	DBot.tagCache[space] = {};
	
	DBot.DefineMySQLTable('tags__' + space + '_client_init', 'UID INTEGER NOT NULL');
	DBot.DefineMySQLTable('tags__' + space + '_client', 'UID INTEGER NOT NULL, TAG VARCHAR(64) NOT NULL');
	
	DBot.DefineMySQLTable('tags__' + space + '_server_init', 'UID INTEGER NOT NULL');
	DBot.DefineMySQLTable('tags__' + space + '_server', 'UID INTEGER NOT NULL, TAG VARCHAR(64) NOT NULL');
	
	DBot.DefineMySQLTable('tags__' + space + '_channel_init', 'UID INTEGER NOT NULL');
	DBot.DefineMySQLTable('tags__' + space + '_channel', 'UID INTEGER NOT NULL, TAG VARCHAR(64) NOT NULL');
}

class TagBase {
	onBanned(tag) {
		if (!this.ready)
			return;
		
		MySQL.query('INSERT INTO tags__' + this.space + '_' + this.realm + ' (UID, TAG) VALUES (' + this.uid + ', "' + tag + '")');
	}
	
	onUnBanned(tag) {
		if (!this.ready)
			return;
		
		MySQL.query('DELETE FROM tags__' + this.space + '_' + this.realm + ' WHERE UID = ' + this.uid + ' AND TAG = "' + tag + '"');
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
	
	constructor(obj, space, realm, IDFunc) {
		this.bans = [];
		this.obj = obj;
		this.realm = realm;
		this.ready = false;
		this.uid = IDFunc(obj);
		this.space = space;
		
		var query = 'SELECT UID FROM tags__' + this.space + '_' + this.realm + '_init WHERE UID = ' + this.uid;
		
		var Me = this;
		
		MySQL.query(query, function(err, data) {
			if (!data[0]) {
				Me.ready = true;
				var bans = DBot.tags[Me.space].bans;
				
				for (var i in bans) {
					Me.banTag(bans[i]);
				}
				
				hook.Run('TagsInitialized', Me.realm, obj, Me.space, Me);
				MySQL.query('INSERT INTO tags__' + Me.space + '_' + Me.realm + '_init (UID) VALUES (' + Me.uid + ')');
			} else {
				MySQL.query('SELECT TAG FROM tags__' + Me.space + '_' + Me.realm + ' WHERE UID = ' + Me.uid, function(err, data) {
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
	if (cache[space][user.id])
		return cache[space][user.id];
	
	cache[space][user.id] = new TagBase(user, space, 'client', DBot.GetUserID);
	return cache[space][user.id];
}

DBot.ServerTags = function(server, space) {
	if (cache[space][server.id])
		return cache[space][server.id];
	
	cache[space][server.id] = new TagBase(server, space, 'server', DBot.GetServerID);
	return cache[space][server.id];
}

DBot.ChannelTags = function(channel, space) {
	if (cache[space][channel.id])
		return cache[space][channel.id];
	
	cache[space][channel.id] = new TagBase(channel, space, 'channel', DBot.GetChannelID);
	return cache[space][channel.id];
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
	cache[space][user.id] = undefined;
}

DBot.UnloadServerTags = function(server, space) {
	cache[space][server.id] = undefined;
}

DBot.UnloadChannelTags = function(channel, space) {
	cache[space][channel.id] = undefined;
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
