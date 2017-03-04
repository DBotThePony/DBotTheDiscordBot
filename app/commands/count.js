
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

let Actions = {
	roles: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return DBot.CommandError('PM? ;n;', 'count', args, 1);
		
		if (!args[1]) {
			let total = 0;
			
			for (let server of DBot.GetServers()) {
				total += server.roles.array().length;
			}
			
			return 'Total roles on this server: **' + msg.channel.guild.roles.array().length + '**\nTotal roles on all servers: **' + total + '**';
		} else {
			if (args[1] == 'list') {
				let names = [];
				
				for (let role of msg.channel.guild.roles.array()) {
					names.push(role.name);
				}
				
				return '```' + names.join(', ') + '```';
			} else if (args[1] == 'total' || args[1] == 'all') {
				Postgres.query('SELECT COUNT(*) AS "COUNT" FROM roles', function(err, data) {
					if (err) {
						msg.reply('Something went wrong ;n;');
						return;
					}
					
					msg.reply('I totally remember **' + data[0].COUNT + '** unqiue roles!');
				});
			} else if (args[1] == 'server' && args[2] && (args[2] == 'total' || args[2] == 'all')) {
				Postgres.query('SELECT COUNT(*) AS "COUNT" FROM roles WHERE "SERVER" = ' + sql.Server(msg.channel.guild), function(err, data) {
					if (err) {
						msg.reply('Something went wrong ;n;');
						return;
					}
					
					msg.reply('I totally remember **' + data[0].COUNT + '** unqiue roles on this server!');
				});
			} else if (args[1] == 'users') {
				let tags = [];
				
				for (let role of msg.channel.guild.roles.array()) {
					tags.push([role.name, role.members.array().length]);
				}
				
				tags.sort(function(a, b) {
					if (a[1] < b[1]) {
						return 1;
					} else {
						return -1;
					}
					
					return 0;
				});
				
				let output = '```\n';
				
				for (let i = 0; i < 10; i++) {
					if (!tags[i])
						break;
					
					output += String.appendSpaces(tags[i][0], 20) + tags[i][1] + ' Users\n';
				}
				
				return output + '```';
			} else {
				return DBot.CommandError('Unknown subcommand', 'count', args, 2);
			}
		}
	},
	
	servers: function(args, cmd, msg) {
		if (!args[1]) {
			return 'Totally running on **' + DBot.GetServers().length + '** servers!';
		} else if (args[1] == 'total' || args[1] == 'all') {
			Postgres.query('SELECT COUNT(*) AS "COUNT" FROM servers', function(err, data) {
				if (err) {
					msg.reply('Something went wrong ;n;');
					return;
				}
				
				msg.reply('I totally remember **' + data[0].COUNT + '** servers!');
			});
		} else if (args[1] == 'top' || args[1] == 'top10') {
			let servers = [];
			
			for (let server of DBot.GetServers()) {
				let users = server.members.array().length;
				servers.push(['<' + server.id + '> ' + server.name, users, DBot.GetServerID(server), server.large]);
			}
			
			servers.sort(function(a, b) {
				if (a[1] < b[1]) {
					return 1;
				} else {
					return -1;
				}
				
				return 0;
			});
			
			let output = '```\n';
			
			for (let i = 0; i < 10; i++) {
				if (!servers[i])
					break;
				
				output += String.appendSpaces(servers[i][0], 60) + (!servers[i][3] && servers[i][1] || '~' + servers[i][1]) + ' Users (Internal ID: ' + servers[i][2] + ')\n';
			}
			
			return output + '```';
		} else {
			return DBot.CommandError('Unknown subcommand', 'count', args, 2);
		}
	},
	
	channels: function(args, cmd, msg) {
		if (!args[1]) {
			let num = 0;
			
			for (let server of DBot.GetServers()) {
				num += server.channels.array().length;
			}
			
			return 'Totally running on **' + num + '** channels!';
		} else if (args[1] == 'total' || args[1] == 'all') {
			Postgres.query('SELECT COUNT(*) AS "COUNT" FROM channels', function(err, data) {
				if (err) {
					msg.reply('Something went wrong ;n;');
					return;
				}
				
				msg.reply('I totally remember **' + data[0].COUNT + '** channels!');
			});
		} else if (args[1] == 'list') {
			return 'Use `channels` command';
		} else {
			return DBot.CommandError('Unknown subcommand', 'count', args, 2);
		}
	},
	
	users: function(args, cmd, msg) {
		if (!args[1]) {
			let num = 0;
			
			for (let server of DBot.GetServers()) {
				num += server.members.array().length;
			}
			
			return 'Serving **' + num + '** members. To get unique amount of members, type `count users unique`';
		} else {
			if (args[1] == 'unique') {
				return 'Serving **' + DBot.GetUsers().length + '** unique members!';
			} else if (args[1] == 'all' || args[1] == 'total') {
				Postgres.query('SELECT COUNT(*) AS "COUNT" FROM users', function(err, data) {
					if (err) {
						msg.reply('Something went wrong ;n;');
						return;
					}
					
					msg.reply('I totally remember **' + data[0].COUNT + '** users!');
				});
			} else if (args[1] == 'members' && args[2] && (args[2] == 'all' || args[2] == 'total')) {
				Postgres.query('SELECT COUNT(*) AS "COUNT" FROM members', function(err, data) {
					if (err) {
						msg.reply('Something went wrong ;n;');
						return;
					}
					
					msg.reply('I totally remember **' + data[0].COUNT + '** unique members! (user-server combination)');
				});
			} else if (args[1] == 'online') {
				if (args[2] && args[2].toLowerCase() == 'explicit') {
					let num = 0;
					let usrs = 0;
					
					for (let user of DBot.GetUsers()) {
						usrs++;
						if (user.presence.status == 'online')
							num++;
					}
					
					return 'Serving **' + usrs + '** unique users, online users: **' + num + '**';
				} else {
					let num = 0;
					let usrs = 0;
					
					for (let user of DBot.GetUsers()) {
						usrs++;
						if (user.presence.status != 'offline')
							num++;
					}
					
					return 'Serving **' + usrs + '** unique users, non-offline users: **' + num + '**';
				}
			} else if (args[1] == 'offline') {
				let num = 0;
				let usrs = 0;
				
				for (let user of DBot.GetUsers()) {
					usrs++;
					if (user.presence.status == 'offline')
						num++;
				}
				
				return 'Serving **' + usrs + '** unique users, offline users: **' + num + '**';
			} else if (args[1] == 'away' || args[1] == 'idle') {
				let num = 0;
				let usrs = 0;
				
				for (let user of DBot.GetUsers()) {
					usrs++;
					if (user.presence.status == 'idle')
						num++;
				}
				
				return 'Serving **' + usrs + '** unique users, AFK users: **' + num + '**';
			} else if (args[1] == 'dnd') {
				let num = 0;
				let usrs = 0;
				
				for (let user of DBot.GetUsers()) {
					usrs++;
					if (user.presence.status == 'dnd')
						num++;
				}
				
				return 'Serving **' + usrs + '** unique users, DND users: **' + num + '**';
			} else {
				return DBot.CommandError('Unknown subcommand', 'count', args, 2);
			}
		}
	},
	
}

let help = `Sum commands are:
roles
roles list
roles total
roles users
roles server total
servers
servers top
servers total
channels
channels total
users
users unqiue
users total
users members total
users online
users online explicit
users offline
users away
users dnd
`;

module.exports = {
	name: 'count',
	
	help_args: '<action> ...',
	desc: 'Displays some statistics',
	desc_full: help,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('No action specified', 'count', args, 1);
		
		if (!Actions[args[0].toLowerCase()])
			return DBot.CommandError('No such action', 'count', args, 1);
		
		if (args[1])
			args[1] = args[1].toLowerCase();
		
		let func = Actions[args[0].toLowerCase()];
		
		return func(args, cmd, msg);
	}
}
