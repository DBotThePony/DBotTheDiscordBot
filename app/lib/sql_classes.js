
/* global Symbol */


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

const iterableFuncitonCollection = function* () {
	for (const obj of this.objects) {
		yield obj;
	}
};

class SQLCollectionBase {
	constructor() {
		this.ids = [];
		this.ids_mapped = new Map();
		this.uidMap = [];
		this.uidMap_mapped = new Map();
		this.objects = [];
		this.length = 0;
		
		this.ids_request = null;
		this.ids_array = null;
		this.uids_array_base = null;
		this.cached_joinUID = null;
		this[Symbol.iterator] = iterableFuncitonCollection;
	}
	
	static from(obj) {
		let newObj = new MemberSQLCollection();
		
		if (Array.isArray(obj))
			for (const o of obj)
				this.push(o);
		else if (obj instanceof Map)
			for (const o of obj.values())
				this.push(o);
	}
	
	push() {
		for (const obj of arguments) {
			this.objects.push(obj);
			this.length++;
		}
		
		return this;
	}
	
	onSplice(id, obj) {
		// Override
	}
	
	splice(id) {
		const splice_id = this.ids.splice(id, 1);
		this.ids_mapped.delete(splice_id);
		
		const splice_uid = this.uidMap.splice(id, 1);
		this.uidMap_mapped.delete(splice_uid);
		
		const obj = this.objects.splice(id, 1);
		this.onSplice(id, obj);
		
		this.length--;
		return obj;
	}
	
	spliceObject(id) {
		for (const i in this.objects) {
			const obj = this.objects[i];
			
			if (obj.uid === id || obj.id === id) {
				return this.splice(i);
			}
		}
		
		return null;
	}
	
	updateMapPre() {
		// Override
	}
	
	mapEntryUpdate(object, i) {
		// Override
	}
	
	updateMap() {
		this.updateMapPre();
		this.uidMap = new Array(this.objects.length);
		this.ids = new Array(this.objects.length);
		this.iterableArray = this.objects;
		
		this.ids_mapped.clear();
		this.uidMap_mapped.clear();
		
		this.ids_request = null;
		this.ids_array = null;
		this.uids_array_base = null;
		this.cached_joinUID = null;
		
		for (const i in this.objects) {
			const obj = this.objects[i];
			const can = this.mapEntryUpdate(obj, i);
			if (can === false) continue;
			this.ids[i] = obj.id;
			
			this.ids_mapped.set(obj.id, obj);
			
			if (obj.uid !== undefined) {
				this.uidMap[i] = obj.uid;
				this.uidMap_mapped.set(Number(obj.uid), obj);
			} else {
				this.uidMap[i] = undefined;
			}
		}
	}
	
	joinUID() {
		if (this.cached_joinUID)
			return this.cached_joinUID;
		let output;
		
		for (const val of this.uidMap) {
			if (val === undefined) continue;
			if (output)
				output += ',' + val;
			else
				output = String(val);
		}
		
		this.cached_joinUID = output;
		return output;
	}
	
	getIDsArray() {
		if (this.ids_array)
			return this.ids_array;
		
		this.ids_array = sql.Array(this.ids);
		return this.ids_array;
	}
	
	
	getUIDsArray() {
		if (this.uids_array_base)
			return this.uids_array_base;
		
		this.uids_array_base = sql.Array(this.uidMap);
		return this.uids_array_base;
	}
	
	buildIDsRequest() {
		console.trace('Non-overrided buildIDsRequest() function was called!');
		return ''; // Override
	}
	
	getByUID(objUID) {
		const reply = this.uidMap_mapped.get(Number(objUID));
		
		if (reply === undefined)
			return null;
		else
			return reply;
	}
	
	getByUIDArray(objUID) {
		for (const i in this.uidMap) {
			if (this.uidMap[i] === objUID)
				return this.objects[i];
		}
		
		return null;
	}
	
	getByID(objID) {
		const reply = this.ids_mapped.get(String(objID));
		
		if (reply === undefined)
			return null;
		else
			return reply;
	}
	
	
	getByIDArray(objID) {
		for (const i in this.ids) {
			if (this.ids[i] === objID)
				return this.objects[i];
		}
		
		return null;
	}
	
	isRubbish(obj) {
		console.trace('Non-overrided isRubbish() function was called!');
		return false; // Override
	}
	
	cleanup() {
		if (this.forceFetch) return;
		let toSweep = [];
		
		for (const i in this.objects)
			if (this.isRubbish(this.objects[i]))
				toSweep.push(i);
		
		for (const i in toSweep) {
			this.splice(toSweep[i] - i);
		}
	}
	
	loadCallback(err, data) {
		// Override if needed
		if (err) throw err;

		this.parseRows(data);
	}
	
	load(callback) {
		this.cleanup();
		
		if (this.length === 0) {
			if (callback) callback(this);
			return;
		};
		
		let self = this;
		const build = this.buildIDsRequest();
		
		if (!build) {
			if (callback) callback(self);
			return;
		};
		
		if (typeof build === 'string') {
			Postgres.query('SELECT ' + build, function(err, data) {
				self.loadCallback(err, data);

				if (callback) callback(self);
			});
		} else {
			let done = 0;
			let total = build.length;
			
			for (const q of build) {
				Postgres.query('SELECT ' + q, function(err, data) {
					self.loadCallback(err, data);

					done++;
					
					if (done === total)
						if (callback)
							callback(self);
				});
			}
		}
	}
	
	defaultIDsRequest() {
		// Generic case
		if (this.ids_request)
			return this.ids_request;
		
		this.ids_request = [];
		let cI = 0;
		let cBuild;
		
		for (const id of this.ids) {
			cI++;
			
			if (cBuild)
				cBuild += ',\'' + id + '\'';
			else
				cBuild = '\'' + id + '\'';
			
			if (cI > 1000) {
				this.ids_request.push(`${this.ids_function_name}(ARRAY [${cBuild}]::VARCHAR(64)[]) AS "RESULT";`);
				cBuild = undefined;
				cI = 0;
			}
		}
		
		if (cBuild !== undefined) {
			this.ids_request.push(`${this.ids_function_name}(ARRAY [${cBuild}]::VARCHAR(64)[]) AS "RESULT";`);
		}
		
		return this.ids_request;
	}
	
	parseRows(data) {
		for (const row of data)
			this.parseRow(row, true);
	}
	
	parseRow(row, isCascade) {
		// Override
		
		console.trace('Non-overrided parseRow() function was called!');
	}
};

class ServerSQLCollection extends SQLCollectionBase {
	constructor() {
		super();
		this.preventDupes = {};
		this.ids_function_name = 'get_servers_id';
	}
	
	buildIDsRequest() {
		return this.defaultIDsRequest();
	}
	
	isRubbish(obj) {
		let id = obj.id;

		if (DBot.ServersIDs[id]) {
			obj.uid = DBot.ServersIDs[id];
			return true;
		}
		
		return false;
	}
	
	parseRow(row, isCascade) {
		const exp = row.RESULT.split(',');
		const id = Number(exp[0].substr(1));
		const uid = exp[1].substr(0, exp[1].length - 1);
		
		const server = this.getByID(uid);
		if (!server) return;
		
		server.uid = id;
		DBot.ServersIDs[uid] = id;
		DBot.ServersIDs_R[id] = server;
		hook.Run('ServerInitialized', server, id, isCascade);
		hook.Run('GuildInitialized', server, id, isCascade);
	}
};

class ChannelSQLCollection extends SQLCollectionBase {
	constructor() {
		super();
		this.serverids = [];
		this.serveruids = [];
		this.associated = new Map();
		
		this.sids_array = null;
	}
	
	onSplice(id, obj) {
		this.serverids.splice(id, 1);
		this.serveruids.splice(id, 1);
		
		let sID = obj.guild.uid;
		
		if (!this.associated.has(sID)) return;
		
		let arr = this.associated.get(sID);
		let comp = obj.id;
		
		for (const i in arr) {
			if (comp === arr[i]) {
				arr.splice(i, 1);
				break;
			}
		}
	}
	
	updateMapPre() {
		this.serverids = new Array(this.objects.length);
		this.serveruids = new Array(this.objects.length);
		this.sids_array = null;
		this.associated = new Map();
	}
	
	mapEntryUpdate(channel, i) {
		this.serverids[i] = channel.guild.id;
		this.serveruids[i] = channel.guild.uid;
		let sID = channel.guild.uid;
		
		if (!this.associated.has(sID))
			this.associated.set(sID, []);
		
		this.associated.get(sID).push(channel.id);
	}
	
	getServerIDsArray() {
		if (this.sids_array)
			return this.sids_array;
		
		this.sids_array = sql.Array(this.serveruids);
		return this.sids_array;
	}
	
	buildIDsRequest() {
		if (this.ids_request)
			return this.ids_request;
		
		this.ids_request = [];
		
		for (const [serverID, channelsID] of this.associated) {
			this.ids_request.push(`get_channels_id(${sql.Array(channelsID)}::VARCHAR(64)[],${serverID}) AS "RESULT";`);
		}
		
		return this.ids_request;
	}
	
	isRubbish(obj) {
		let id = obj.id;

		if (DBot.ChannelIDs[id]) {
			obj.uid = DBot.ChannelIDs[id];
			return true;
		}
		
		return false;
	}
	
	parseRow(row, isCascade) {
		const exp = row.RESULT.split(',');
		const id = Number(exp[0].substr(1));
		const uid = exp[1].substr(0, exp[1].length - 1);
		
		const channel = this.getByID(uid);
		if (!channel) return;
		
		channel.uid = id;
		DBot.ChannelIDs[uid] = id;
		DBot.ChannelIDs_R[id] = channel;
		hook.Run('ChannelInitialized', channel, id, isCascade);
	}
};

class UserSQLCollection extends SQLCollectionBase {
	constructor() {
		super();
		this.ids_function_name = 'get_users_id';
	}
	
	buildIDsRequest() {
		return this.defaultIDsRequest();
	}
	
	isRubbish(obj) {
		let id = obj.id;

		if (DBot.UsersIDs[id]) {
			obj.uid = DBot.UsersIDs[id];
			return true;
		}
		
		return false;
	}
	
	parseRow(row, isCascade) {
		const exp = row.RESULT.split(',');
		const id = Number(exp[0].substr(1));
		const uid = exp[1].substr(0, exp[1].length - 1);
		
		sql.LoadingUser[uid] = undefined;
		
		const user = this.getByID(uid);
		if (!user) return;
		
		user.uid = id;
		DBot.UsersIDs[uid] = id;
		DBot.UsersIDs_R[id] = user;
		hook.Run('UserInitialized', user, id, isCascade);
		hook.Run('ClientInitialized', user, id, isCascade);
	}
};

class MemberSQLCollection extends SQLCollectionBase {
	constructor() {
		super();
		this.serveruids = [];
		this.users_ids = [];
		this.mapped_array = [];
		this.members_map = new Map();
		
		this.sids_array = null;
		this.uids_array = null;
	}
	
	getInternalID(member) {
		try {
			return member.user.uid + '___' + member.guild.uid;
		} catch(err) {
			return '-1_-1';
		}
	}
	
	onSplice(id, obj) {
		this.serveruids.splice(id, 1);
		this.users_ids.splice(id, 1);
		this.members_map.delete(this.getInternalID(obj));
		
		if (!obj.guild || !obj.user || !obj.guild.uid) return;
		if (this.mapped_array[obj.guild.uid]) {
			for (const i in this.mapped_array[obj.guild.uid]) {
				if (this.mapped_array[obj.guild.uid][i] === obj.user.uid) {
					this.mapped_array[obj.guild.uid].splice(i, 1);
					break;
				}
			}
		}
	}
	
	getMemberHash(str) {
		const reply = this.members_map.get(str);
		
		if (reply === undefined)
			return null;
		else
			return reply;
	}
	
	updateMapPre() {
		this.serveruids = new Array(this.objects.length);
		this.users_ids = new Array(this.objects.length);
		this.mapped_array = [];
		this.members_map.clear();
		this.sids_array = null;
		this.uids_array = null;
	}
	
	mapEntryUpdate(obj, i) {
		if (!obj.guild || !obj.guild.uid || !obj.user) return false;
		this.serveruids[i] = obj.guild.uid;
		this.users_ids[i] = obj.user.uid;
		this.members_map.set(this.getInternalID(obj), obj);
		this.mapped_array[obj.guild.uid] = this.mapped_array[obj.guild.uid] || [];
		
		if (obj.user.uid)
			this.mapped_array[obj.guild.uid].push(obj.user.uid);
	}
	
	getServerIDsArray() {
		if (this.sids_array)
			return this.sids_array;
		
		this.sids_array = sql.Array(this.serveruids);
		return this.sids_array;
	}
	
	
	getUsersIDsArray() {
		if (this.uids_array)
			return this.uids_array;
		
		this.uids_array = sql.Array(this.users_ids);
		return this.uids_array;
	}
	
	buildIDsRequest() {
		if (this.ids_request)
			return this.ids_request;
		
		this.ids_request = [];
		
		for (const sUID in this.mapped_array) {
			this.ids_request.push(`SELECT get_members_id(${sUID},${sql.Array(this.mapped_array[sUID])}::INTEGER[]) AS "RESULT";`);
		}
		
		return this.ids_request;
	}
	
	load(callback) {
		this.cleanup();
		
		if (this.length === 0) {
			if (callback) callback(this);
			return;
		};
		
		let self = this;
		const build = this.buildIDsRequest();
		
		if (build.length === 0) {
			if (callback) callback(self);
			return;
		};
		
		let finished = 0;
		
		for (const sqlStr of this.ids_request) {
			Postgres.query(sqlStr, function(err, data) {
				if (err) throw err;
				self.parseRows(data);
				
				finished++;
				
				if (finished === build.length)
					if (callback)
						callback(self);
			});
		}
	}
	
	isRubbish(obj) {
		try {
			if (DBot.MemberIDs[obj.user.id] === undefined)
				DBot.MemberIDs[obj.user.id] = {};

			if (DBot.MemberIDs[obj.user.id][obj.guild.id]) {
				obj.uid = DBot.MemberIDs[obj.user.id][obj.guild.id];
				return true;
			}

			return false;
		} catch(err) {
			return false;
		}
	}
	
	parseRow(row, isCascade) {
		const exp = row.RESULT.split(',');
		const id = Number(exp[0].substr(1));
		const userid = exp[1];
		const serverid = exp[2].substr(0, exp[2].length - 1);
		
		let member = this.getMemberHash(userid + '___' + serverid);
		
		if (!member) {
			const server = DBot.GetServer(serverid);
			const user = DBot.GetUser(userid);
			member = server.member(user);
			
			if (!member) return; // what the fuck
		}
		
		member.uid = id;
		
		DBot.MemberIDs[member.user.id] = DBot.MemberIDs[member.user.id] || {};
		DBot.MemberIDs[member.user.id][member.guild.id] = id;
		sql.MembersTable[id] = member;
		
		hook.Run('MemberInitialized', member, member.uid, isCascade);
	}
};

class RoleSQLCollection extends SQLCollectionBase {
	constructor() {
		super();
		this.mapped = new Map();
		this.mapped_servers = new Map();
		this.mapped_hash = new Map();
	}
	
	getInternalID(role) {
		try {
			return role.id + '___' + role.guild.uid;
		} catch(err) {
			return '-1_-1';
		}
	}
	
	onSplice(id, obj) {
		if (!obj.guild) return; // Welcome to Discord.js
		if (!this.mapped.has(Number(obj.guild.uid)))
			this.mapped.set(Number(obj.guild.uid), []);
		
		this.mapped_hash.delete(this.getInternalID(obj));
		let myArr = this.mapped.get(Number(obj.guild.uid));
		for (const i in myArr) {
			if (myArr[i].id === obj.id)
				myArr.splice(i, 1);
		}
	}
	
	getRoleHash(str) {
		const reply = this.mapped_hash.get(str);
		
		if (reply === undefined)
			return null;
		else
			return reply;
	}
	
	updateMapPre() {
		this.mapped.clear();
		this.mapped_servers.clear();
		this.mapped_hash.clear();
	}
	
	mapEntryUpdate(obj, i) {
		if (!obj.guild) return; // Welcome to Discord.js
		if (!this.mapped.has(Number(obj.guild.uid)))
			this.mapped.set(Number(obj.guild.uid), []);
		
		this.mapped.get(Number(obj.guild.uid)).push(obj.id);
		this.mapped_hash.set(this.getInternalID(obj), obj);
		this.mapped_servers.set(Number(obj.guild.uid), obj.guild);
	}
	
	load(callback) {
		this.cleanup();
		let roleQuery = [];
		
		for (const [server, roles] of this.mapped) {
			if (roles.length === 0) continue;
			roleQuery.push(`SELECT get_roles_id(${server},${sql.Array(roles)}::VARCHAR(64)[]) AS "RESULT";`);
		}
		
		let self = this;
		let done = 0;
		let total = roleQuery.length;
		
		for (const q of roleQuery) {
			Postgres.query(q, function(err, data) {
				if (err) throw err;
				self.parseRows(data);
				
				done++;
				
				if (done === total)
					if (callback)
						callback(self);
			});
		}
	}
	
	isRubbish(obj) {
		return obj.uid !== undefined;
	}
	
	parseRow(row, isCascade) {
		const exp = row.RESULT.split(',');
		const id = Number(exp[0].substr(1));
		const uid = exp[1];
		const serverid = Number(exp[2].substr(0, exp[2].length - 1));
		
		const server = this.mapped_servers.get(serverid);
		const role = this.getRoleHash(uid + '___' + serverid);
		if (!role) return;
		if (!server) return;
		
		role.uid = id;
		
		hook.Run('RoleInitialized', role, role.uid, true);
	}
};

sql.ChannelSQLCollection = ChannelSQLCollection;
sql.MemberSQLCollection = MemberSQLCollection;
sql.UserSQLCollection = UserSQLCollection;
sql.ServerSQLCollection = ServerSQLCollection;
sql.RoleSQLCollection = RoleSQLCollection;
