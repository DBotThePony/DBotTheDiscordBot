

// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

let massiveMemberLoad = false;

hook.Add('ValidClientLeftServer', 'Postgres.Handlers', function(user, server) {
	let id = user.id;
	if (!DBot.UserIsGarbage(id))
		return;
	
	hook.Run('PreDeleteUser', user);
	DBot.UsersIDs_R[DBot.UsersIDs[id]] = undefined;
	DBot.UsersIDs[id] = undefined;
	hook.Run('PostDeleteUser', user);
});

hook.Add('OnJoinedServer', 'Postgres.Handlers', function(server) {
	DBot.DefineServer(server);
});

hook.Add('ChannelCreated', 'Postgres.Handlers', function(channel) {
	if (!channel.guild)
		return;
	
	if (channel.type === 'dm')
		return;
	
	// Channel in a new server
	if (!DBot.ServersIDs[channel.guild.id])
		return;
	
	DBot.DefineChannel(channel);
});

hook.Add('ValidClientJoinsServer', 'Postgres.Handlers', function(user, server, member) {
	DBot.DefineUser(user);
	DBot.DefineMember(member);
});

hook.Add('ValidClientAvaliable', 'Postgres.Handlers', function(user, server, member) {
	if (massiveMemberLoad > 0) return;
	DBot.DefineUser(user);
	DBot.DefineMember(member);
});

const ChannelDeleted = function(channel) {
	hook.Run('PreDeleteChannel', channel);
	DBot.ChannelIDs_R[DBot.ChannelIDs[channel.id]] = undefined;
	DBot.ChannelIDs[channel.id] = undefined;
	hook.Run('PostDeleteChannel', channel);
};

hook.Add('ChannelDeleted', 'Postgres.Handlers', ChannelDeleted);

hook.Add('OnLeftServer', 'Postgres.Handlers', function(server) {
	server.channels.array().forEach(ChannelDeleted);
	
	hook.Run('PreDeleteServer', server);
	DBot.ServersIDs_R[DBot.ServersIDs[server.id]] = undefined;
	DBot.ServersIDs[server.id] = undefined;
	hook.Run('PostDeleteServer', server);
});

hook.Add('RoleChanged', 'Postgres.Handlers', function(oldRole, newRole) {
	if (!DBot.IsReady()) return;
	if (!oldRole.guild.uid)
		return;
	
	newRole.uid = newRole.uid || oldRole.uid;
	
	if (!newRole.uid) {
		DBot.DefineRole(newRole);
		return;
	}
	
	sql.updateRole(newRole);
});


hook.Add('ServerInitialized', 'Postgres.Saves', function(server, id, isCascade) {
	if (!DBot.SQLReady()) return;
	if (!server.name) return;
	
	Postgres.query('UPDATE servers SET "NAME" = ' + Postgres.escape(server.name) + ' WHERE "ID" = ' + id, function(err) {
		if (!err)
			return;
		
		console.error('Failed to save server name ' + id + ' (' + server.name + ')!');
		console.error(err);
	});
});

hook.Add('ServersInitialized', 'Postgres.Saves', function(servers) {
	let finalQuery;
	
	for (let server of servers) {
		if (!server.name) continue;
		
		if (finalQuery)
			finalQuery += ',';
		else
			finalQuery = '';
		
		finalQuery += '(' + server.uid + ', ' + Postgres.escape(server.name) + ')';
	}
	
	if (!finalQuery) return;
	
	Postgres.query('UPDATE servers SET "NAME" = m."NAME" FROM (VALUES ' + finalQuery + ') AS m ("ID", "NAME") WHERE servers."ID" = m."ID"', function(err) {
		if (err) console.error(err);
	});
});

hook.Add('ChannelInitialized', 'Postgres.Saves', function(channel, id, isCascade) {
	if (!DBot.SQLReady()) return;
	if (!channel.name) return;
	
	Postgres.query('UPDATE channels SET "NAME" = ' + Postgres.escape(channel.name) + ' WHERE "ID" = ' + id, function(err) {
		if (!err)
			return;
		
		console.error('Failed to save channel name ' + id + ' (' + channel.name + ')!');
		console.error(err);
	});
});

hook.Add('ChannelsInitialized', 'Postgres.Saves', function(channels) {
	let finalQuery;
	
	for (let channel of channels) {
		if (!channel.name) continue;
		
		if (finalQuery)
			finalQuery += ',';
		else
			finalQuery = '';
		
		finalQuery += '(' + channel.uid + ', ' + Postgres.escape(channel.name) + ')';
	}
	
	if (!finalQuery) return;
	
	Postgres.query('UPDATE channels SET "NAME" = m."NAME" FROM (VALUES ' + finalQuery + ') AS m ("ID", "NAME") WHERE channels."ID" = m."ID"', function(err) {
		if (err) console.error(err);
	});
});

sql.fetchMembers = function(server) {
	massiveMemberLoad++;
	
	let hashMap = new Map();
	
	for (const member of server.members.values()) {
		hashMap.set(member.id, member);
	}
	
	hook.Run('PreMembersFetch', server.members.array(), server, hashMap);

	server.fetchMembers()
	.then(function() {
		massiveMemberLoad--;
		let userCollection = new sql.UserSQLCollection();
		let collection = new sql.MemberSQLCollection();

		for (const member of server.members.values()) {
			collection.push(member);
			userCollection.push(member.user);
		}

		userCollection.cleanup();
		userCollection.updateMap();
		userCollection.load(function() {
			collection.updateMap();
			collection.load(function() {
				for (const member of server.members.array()) {
					const getMember = hashMap.get(member.id);
					if (!getMember) continue;
					member.uid = getMember.uid;
					hook.Run('CopyMemberProperties', getMember, member);
				}
				
				collection.updateMap();
				hook.Run('MembersFetched', server.members.array(), server, hashMap, collection);
			});
		});
	}).catch(function(err) {
		console.error(err);
		massiveMemberLoad--;
	});
};

hook.Add('CheckValidMessage', 'Postgres.Checker', function(msg) {
	if (!DBot.IsReady()) return true;
	if (!DBot.UserIsInitialized(msg.author)) {
		DBot.DefineUser(msg.author);
		return true;
	}
	
	if (!DBot.IsPM(msg)) {
		if (!DBot.ServerIsInitialized(msg.channel.guild)) {
			DBot.DefineServer(msg.channel.guild);
			return true;
		} else if (!DBot.ChannelIsInitialized(msg.channel)) {
			DBot.DefineChannel(msg.channel);
			return true;
		} else if (!msg.member) { // wtf
			sql.fetchMembers(msg.channel.guild);
			console.error('Unexpected, server ' + msg.channel.guild.name + ' has null member! Fetching...');
			return true;
		} else if (!msg.member.uid) {
			DBot.DefineMember(msg.member);
			return true;
		}
	}
});

hook.Add('UserAvatarChanges', 'SQL', (user) => {
	if (!DBot.IsReady()) return;
	Postgres.query(`UPDATE users SET "AVATAR" = '${user.avatarURL || ''}' WHERE "ID" = ${sql.User(user)};`);
});

setInterval(sql.updateLastSeenFunc, 60000);
hook.Add('BotOnline', 'RegisterIDs', DBot.startSQL);
