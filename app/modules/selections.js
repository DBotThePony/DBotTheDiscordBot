
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const Util = myGlobals.Util;
const Postgres = myGlobals.Postgres;
const fs = require('fs');
const moment = require('moment');

Util.mkdir(DBot.WebRoot + '/selections');

class UserSelection {
	constructor(id) {
		this.id = id;
		this.users = [];
		this.users_objects = [];
		this.users_valids = [];
		this.members = [];
		this.members_valids = [];
		
		this.calculated = false;
		
		this.owner = null;
		this.ownerid = null;
		this.owneruid = null;
		this.stamp = null;
		this.server = null;
		this.serverid = null;
		this.serveruid = null;
	}
	
	calculate() {
		this.users_objects = new Array(this.users.length);
		this.members = new Array(this.users.length);
		let validUsers = 0;
		let validMembers = 0;
		
		for (const i in this.users) {
			const uid = this.users[i];
			const getUser = DBot.GetUser(uid);
			
			if (getUser) {
				this.users_objects[i] = getUser;
				validUsers++;
				this.members[i] = this.server.member(getUser);
				if (this.members[i] !== null) validMembers++;
			} else {
				this.users_objects[i] = null;
				this.members[i] = null;
			}
		}
		
		this.users_valids = new Array(validUsers);
		this.members_valids = new Array(validMembers);
		
		let usersID = 0;
		let membersID = 0;
		
		for (const userObj of this.users_objects) {
			if (userObj !== null) {
				this.users_valids[usersID] = userObj;
				usersID++;
			}
		}
		
		
		for (const userObj of this.members) {
			if (userObj !== null) {
				this.members_valids[membersID] = userObj;
				membersID++;
			}
		}
		
		this.calculated = true;
		return this;
	}
	
	getMembers() {
		if (!this.calculated) this.calculate();
		return this.members;
	}
	
	getValidMembers() {
		if (!this.calculated) this.calculate();
		return this.members_valids;
	}
	
	getUsers() {
		if (!this.calculated) this.calculate();
		return this.users_objects;
	}
	
	getValidUsers() {
		if (!this.calculated) this.calculate();
		return this.users_valids;
	}
	
	getUsersUIDs() {
		return this.users;
	}
	
	getOwner() {
		return this.owner;
	}
	
	isOwner(user) {
		if (typeof user === 'object')
			return this.owner !== null && this.owner.id === user.id;
		else if (typeof user === 'string')
			return this.ownerid === user;
		else if (typeof user === 'number')
			return this.owneruid === user;
		
		return false;
	}
	
	getServer() {
		return this.server;
	}
	
	isServer(server) {
		if (typeof server === 'object')
			return this.server !== null && this.server.id === server.id;
		else if (typeof server === 'string')
			return this.serverid === server;
		else if (typeof server === 'number')
			return this.serveruid === server;
		
		return false;
	}
	
	isValid() {
		return this.server !== null && this.owner !== null;
	}
	
	isValidStrict() {
		if (!this.calculated) this.calculate();
		return this.server !== null && this.owner !== null && this.members_valids.length > 0;
	}
	
	checkCombined(owner, server) {
		return this.isOwner(owner) && this.isServer(server) && this.isValidStrict();
	}
	
	load(data, callback) {
		if (!data) {
			if (callback) callback(this);
			return;
		}
		
		this.stamp = data.stamp;
		this.users = data.users;
		this.owneruid = data.owneruid;
		this.ownerid = data.ownerid;
		this.serveruid = data.serveruid;
		this.serverid = data.serverid;
		
		const getServer = DBot.bot.guilds.get(this.serverid);
		const getUser = DBot.GetUser(this.owneruid);
		
		if (getServer)
			this.server = getServer;
		
		if (getUser)
			this.owner = getUser;
		
		if (callback) callback(this);
	}
	
	fetch(callback) {
		const self = this;
		
		Postgres.query(`SELECT selections."USERS" AS "users", selections."STAMP" AS "stamp", users."ID" AS "owneruid", users."UID" AS "ownerid", servers."ID" AS "serveruid", servers."UID" AS "serverid"
						FROM selections, users, servers
						WHERE selections."ID" = ${this.id} AND users."ID" = selections."OWNER" AND servers."ID" = selections."SERVER";`,
		(err, data) => self.load(data[0], callback));
		
		return this;
	}
	
	toString() {
		return `[SQLSelection ${this.uid}|${this.ownerid}|${this.serverid}]`;
	}
};

DBot.selectionObject = UserSelection;

const findUserExpr = new RegExp('^\\<@!?([0-9]+)\\>');
const findExplicitRole = new RegExp('^\\<@&([0-9]+)\\>');
const findExplicitNickname = new RegExp('^Nickname:(.*)', 'i');
const findRole = new RegExp('^Role:(.*)', 'i');

const parseFunc = function(arg, argID, args, server) {
	const myArray = [];

	const matchUser = arg.match(findUserExpr);
	const matchRole = arg.match(findExplicitRole);
	const matchNick = arg.match(findExplicitNickname);
	const matchRoleName = arg.match(findRole);

	if (matchUser) {
		const user = DBot.IdentifyUser(matchUser[0]);

		if (user)
			if (!myArray.includes(user)) myArray.push(user);
		else
			return DBot.CommandError('Unable to find specified user', 'screate', args, argID);
	} else if (matchRole) {
		const getRole = server.roles.get(matchRole[1]);

		if (getRole)
			for (const member of getRole.members.values())
				if (!myArray.includes(member.user)) myArray.push(member.user);
		else
			return DBot.CommandError('Unable to find specified role', 'screate', args, argID);
	} else if (matchNick) {
		try {
			const expression = new RegExp(matchNick[1]);

			let findUsers = [];

			for (const member of server.members.values())
				if (member.nickname && member.nickname.match(expression) || member.user.username.match(expression))
					findUsers.push(member.user);

			if (findUsers.length === 0)
				return DBot.CommandError('No matched users', 'screate', args, argID);

			for (const user of findUsers)
				if (!myArray.includes(user)) myArray.push(user);
		} catch(err) {
			return DBot.CommandError('Invalid regular expression', 'screate', args, argID);
		}
	} else if (matchRoleName) {
		const getRole = DBot.findRole(server, matchRoleName[1]);

		if (getRole)
			for (const member of getRole.members.values())
				if (!myArray.includes(member.user)) myArray.push(member.user);
		else
			return DBot.CommandError('Unable to find specified role', 'screate', args, argID);
	} else {
		return DBot.CommandError('Unknown argument', 'screate', args, argID);
	}

	return myArray;
};

DBot.RegisterCommand({
	name: 'screate',
	alias: ['creates', 'selectioncreate', 'createselection'],
	
	help_args: '[!]<user1/@role1/Role:.../Nickname:...> ...',
	desc: 'Creates a selection for future use in other commands. Nickname __IS__ a regular expression!',
	nopm: true,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('At least one argument is required', 'screate', args, 1);
		
		const blacklisted = [];
		const selectedUsers = [];
		
		// Pass one - find blacklisted users
		for (const i in args) {
			const iN = Number(i);
			const arg = args[i];
			
			if (arg.substr(0, 1) !== '!')
				continue;
			
			const reply = parseFunc(args[i].substr(1), Number(i) + 1, args, msg.channel.guild);
			
			if (typeof reply === 'string')
				return reply;
			else
				for (const r of reply)
					blacklisted.push(r);
		}
		
		// Pass two - find needed users
		for (const i in args) {
			const iN = Number(i);
			const arg = args[i];
			
			if (arg.substr(0, 1) === '!')
				continue;
			
			const reply = parseFunc(args[i], Number(i) + 1, args, msg.channel.guild);
			
			if (typeof reply === 'string')
				return reply;
			else
				for (const r of reply)
					if (!blacklisted.includes(r))
						selectedUsers.push(r);
		}
		
		if (selectedUsers.length === 0)
			return 'None of users matched selection! ;A;';
		
		let myBuild = [];
		
		for (const user of selectedUsers)
			myBuild.push(sql.User(user));

		msg.channel.startTyping();

		Postgres.query(`INSERT INTO selections ("OWNER", "SERVER", "USERS") VALUES (${sql.User(msg.author)}, ${sql.Server(msg.channel.guild)}, ARRAY [${myBuild.join(',')}]::INTEGER[]) RETURNING "ID";`, (err, data) => {
			msg.channel.stopTyping();

			if (err) {
				msg.reply('*Squeak!* Theres an error! *Squeaks more*');
				console.error(err);
				return;
			}

			msg.reply(`Selection was created! Yays! Selection ID: \`${data[0].ID}\`. Use it as argument in commands that supports selections. Users selected: \`${myBuild.length}\``);
		});
	}
});

DBot.RegisterCommand({
	name: 'sview',
	alias: ['views', 'selectionview', 'viewselection'],
	
	help_args: '<selection id>',
	desc: 'Views a previous created selection',
	nopm: true,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('No selection specified', 'sview', args, 1);
		
		msg.channel.startTyping();
		
		Postgres.query(`SELECT * FROM selections WHERE "OWNER" = ${sql.User(msg.author)} AND "SERVER" = ${sql.Server(msg.channel.guild)} AND "ID" = ${Postgres.escape(args[0])};`, (err, data) => {
			if (!data[0]) {
				msg.channel.stopTyping();
				msg.reply('No such selection with specified ID');
				return;
			}
			
			const sha = String.hash(CurTime() + '_' + msg.channel.guild.id + '_' + msg.author.id);
			const path = DBot.WebRoot + '/selections/' + sha + '.html';
			const pathU = DBot.URLRoot + '/selections/' + sha + '.html';

			const ndata = [];

			for (const userID of data[0].USERS) {
				const user = DBot.GetUser(userID);
				if (!user) continue;
				const member = msg.channel.guild.member(user);
				if (!member) continue;
				
				const cData = {};

				cData.name = member.user.username;
				cData.nname = member.nickname;
				cData.avatar = member.user.avatarURL || '../no_avatar.jpg';
				cData.roles = member.roles.array();
				let max = 0;
				let hexColor;
				let roleName;

				for (const role of member.roles.values()) {
					if (role.position > max) {
						max = role.position;
						hexColor = role.hexColor;
						roleName = role.name;
					}
				}

				cData.role = roleName;
				cData.hexcolor = hexColor;

				ndata.push(cData);
			}
			
			if (ndata.length === 0) {
				msg.channel.stopTyping();
				msg.reply('No valid users in the selection!');
				return;
			}

			fs.writeFile(path, DBot.pugRender('selection.pug', {
				data: ndata,
				total: data[0].USERS.length,
				listed: ndata.length,
				stamp: Util.formatStamp(data[0].STAMP),
				date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
				username: msg.author.username,
				server: msg.channel.guild.name,
				title: `Selection #${args[0]} view`
			}), console.errHandler);

			msg.channel.stopTyping();
			msg.reply(pathU);
		});
	}
});
