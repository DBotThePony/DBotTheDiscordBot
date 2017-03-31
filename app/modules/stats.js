
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const numeral = require('numeral');
const moment = require('moment');
const hDuration = require('humanize-duration');
const sprintf = require('sprintf-js').sprintf;

Util.mkdir(DBot.WebRoot + '/stats');

let never_talk_sql = `
SELECT
	users."UID" AS "USERID",
	users."NAME" AS "USERNAME",
	members."NAME" AS "MEMBERNAME"
FROM
	users,
	members
WHERE
	users."TIME" > currtime() - 120 AND
	users."UID" != '%s' AND
	members."SERVER" = %i AND
	members."USER" = users."ID" AND
    members."USER" NOT IN (
    	SELECT stats__peruser_servers."USER" FROM stats__peruser_servers WHERE stats__peruser_servers."ID" = %i
    )
`;

let never_talk_sql_count = `
SELECT
	COUNT(*) AS "COUNT"
FROM
	users,
	members
WHERE
	users."TIME" > currtime() - 120 AND
	users."UID" != '%s' AND
	members."SERVER" = %i AND
	members."USER" = users."ID" AND
    members."USER" NOT IN (
    	SELECT stats__peruser_servers."USER" FROM stats__peruser_servers WHERE stats__peruser_servers."ID" = %i
    )
`;

let never_talk_channel_sql_count = `
SELECT
	COUNT(*) AS "COUNT"
FROM
	users,
	members
WHERE
	users."TIME" > currtime() - 120 AND
	users."UID" != '%s' AND
	members."SERVER" = %i AND
	members."USER" = users."ID" AND
    members."USER" NOT IN (
    	SELECT stats__peruser_channels."USER"
		FROM stats__peruser_channels, channels
		WHERE stats__peruser_channels."ID" = channels."ID" AND channels."SID" = %i
    )
`;

hook.Add('ChatStart', 'Statistics', function(channel, user) {
	if (user.id === DBot.bot.user.id) return;
	
	if (channel.guild)
		Postgres.query('SELECT stats_typing(\'' + user.id + '\',\'' + channel.guild.id + '\',\'' + channel.id + '\');');
	else
		Postgres.query('SELECT stats_typing(\'' + user.id + '\');');
});

hook.Add('OnValidMessage', 'Statistics', function(msg) {
	if (msg.author.id === '210879254378840074') return; // Loal
	
	let extra = msg.channel.guild !== undefined && msg.channel.type !== 'dm';
	let Words = msg.content.split(/( |\n)+/);
	let rWords = [];
	let length = msg.content.length;
	
	let Images;
	
	if (msg.attachments) {
		Images = msg.attachments.array().length;
	} else {
		Images = 0;
	}
	
	for (let i in Words) {
		if (Words[i].length < 60)
			rWords.push(Words[i]);
	}
	
	if (extra) {
		Postgres.query('SELECT stats_hit(' + sql.Concat(msg.author.id, msg.channel.id, msg.channel.guild.id) + ', ' + length + ', ' + sql.Array(rWords) + '::VARCHAR(64)[], ' + Images + ')', function(err) {
			if (err)
				console.error(err);
		});
	} else {
		Postgres.query('SELECT stats_hit(' + Postgres.escape(msg.author.id) + ', ' + length + ', ' + sql.Array(rWords) + '::VARCHAR(64)[], ' + Images + ')', function(err) {
			if (err)
				console.error(err);
		});
	}
});

hook.Add('OnMessageEdit', 'Statistics', function(oldMessage, msg) {
	if (msg.author.bot)
		return;
	
	let extra = msg.channel.guild !== undefined && msg.channel.type !== 'dm';
	let length = msg.content.length;
	
	if (extra) {
		Postgres.query('SELECT stats_edit(' + sql.Concat(msg.author.id, msg.channel.id, msg.channel.guild.id) + ');');
	} else {
		Postgres.query('SELECT stats_edit(' + Postgres.escape(msg.author.id) + ');');
	}
});

hook.Add('OnMessageDeleted', 'Statistics', function(msg) {
	if (msg.author.bot)
		return;
	
	let extra = msg.channel.guild !== undefined && msg.channel.type !== 'dm';
	let length = msg.content.length;
	
	if (extra) {
		Postgres.query('SELECT stats_delete(' + sql.Concat(msg.author.id, msg.channel.id, msg.channel.guild.id) + ', ' + length + ');');
	} else {
		Postgres.query('SELECT stats_delete(' + Postgres.escape(msg.author.id) + ', ' + length + ');');
	}
});

hook.Add('CommandExecuted', 'Statistics', function(commandID, user, args, cmd, msg) {
	let extra = msg.channel.guild !== undefined && msg.channel.type !== 'dm';
	
	if (extra) {
		Postgres.query('SELECT stats_command(' + sql.Concat(msg.author.id, msg.channel.id, msg.channel.guild.id) + ', ' + Postgres.escape(commandID) + ');');
	} else {
		Postgres.query('SELECT stats_command(' + Postgres.escape(msg.author.id) + ', ' + Postgres.escape(commandID) + ');');
	}
});


let serversQuery = `
SELECT
	servers."UID" AS "UID",
	servers."NAME" AS "NAME",
	stats__generic_servers."CHARS" AS "TOTAL_CHARS",
	stats__generic_servers."MESSAGES" AS "TOTAL_PHRASES",
	SUM(stats__command_servers."COUNT") AS "TOTAL_COMMANDS"
FROM
	servers,
	stats__generic_servers,
	stats__command_servers
WHERE
	servers."TIME" > currtime() - 120 AND
	stats__generic_servers."ID" = servers."ID" AND
	stats__command_servers."ID" = servers."ID"
GROUP BY
	servers."UID",
	servers."ID",
	servers."NAME",
	stats__generic_servers."ID",
	stats__command_servers."ID",
	"TOTAL_CHARS",
	"TOTAL_PHRASES"
ORDER BY "TOTAL_PHRASES" DESC
LIMIT 10
`;

DBot.RegisterCommand({
	name: 'servers',
	
	help_args: '',
	desc: 'Displays most spampost servers',
	delay: 10,
	
	func: function(args, cmd, msg) {
		msg.channel.startTyping();
		
		let validIDs = [];
		
		for (const [_sid, server] of DBot.bot.guilds) {
			validIDs.push(server.uid);
		}
		
		Postgres.query(serversQuery, function(err, data) {
			msg.channel.stopTyping();
			
			if (err) {
				msg.reply('<internal pony error>');
				return;
			}
			
			let output = '```\n' + String.appendSpaces('Server name', 60) + String.appendSpaces('Total phrases', 15) + String.appendSpaces('Chars printed', 15) + String.appendSpaces('Total commands executed', 10) + '\n';
			
			for (let row of data) {
				output += String.appendSpaces('<' + row.UID.trim() + '> ' + row.NAME, 60) + String.appendSpaces(numeral(row.TOTAL_PHRASES).format('0,0'), 15) + String.appendSpaces(numeral(row.TOTAL_CHARS).format('0,0'), 15) + String.appendSpaces(numeral(row.TOTAL_COMMANDS).format('0,0'), 10) + '\n';
			}
			
			msg.reply(output + '```');
		});
	}
});

const top10fn = function(name, order) {
	return function(args, cmd, msg) {
		const page = Number.from(args[0]) || 1;
		
		if (page <= 0)
			return DBot.CommandError('what', name, args, 1);
		
		const offset = (page - 1) * 200;
		
		msg.channel.startTyping();
		
		const ID = DBot.GetServerID(msg.channel.guild);
		
		const query = `
			SELECT
				users."UID" as "USERID",
				users."ID" as "ID",
				users."AVATAR" as "AVATAR",
				members."NAME" as "NICKNAME",
				users."NAME" as "USERNAME",
				stats__peruser_servers."MESSAGES" as "COUNT",
				SUM(stats__uwords_servers."COUNT") AS "TOTAL_WORDS",
				COUNT(DISTINCT stats__uwords_servers."WORD") AS "TOTAL_UNIQUE_WORDS"
			FROM
				users,
				members,
				stats__peruser_servers,
				stats__uwords_servers
			WHERE
				stats__peruser_servers."ID" = ${ID} AND
				stats__uwords_servers."ID" = ${ID} AND
				members."SERVER" = stats__peruser_servers."ID" AND
				members."USER" = users."ID" AND
				stats__peruser_servers."USER" = users."ID" AND
				stats__uwords_servers."USER" = users."ID" AND
				users."TIME" > currtime() - 120
			GROUP BY
				users."UID",
				users."ID",
				members."NAME",
				stats__peruser_servers."MESSAGES"
			ORDER BY "${order}" DESC
			OFFSET ${offset} LIMIT 200`;
		
		Postgres.query(query, function(err, data) {
			if (err) {
				console.error(err);
				msg.reply('<internal pony error>');
				msg.channel.stopTyping();
				return;
			}
			
			if (!data[0]) {
				msg.channel.stopTyping();
				msg.reply('No data was returned in query');
				return;
			}
			
			try {
				const sha = String.hash(CurTime() + '_' + msg.channel.guild.id + '_' + msg.author.id);
				const path = DBot.WebRoot + '/stats/' + sha + '.html';
				const pathU = DBot.URLRoot + '/stats/' + sha + '.html';
				
				const output = [];
				
				let i = 0;
				
				for (const row of data) {
					const myData = {};
					output.push(myData);
					
					myData.rank = Number(i) + 1 + (page - 1) * 200;
					myData.username = row.USERNAME;
					myData.avatar = row.AVATAR || '../no_avatar.jpg';
					
					if (row.USERNAME !== row.NICKNAME)
						myData.nickname = row.NICKNAME;
					
					myData.count = numeral(row.COUNT).format('0,0');
					myData.totalw = numeral(row.TOTAL_WORDS).format('0,0');
					myData.totalwq = numeral(row.TOTAL_UNIQUE_WORDS).format('0,0');
					
					i++;
				}
				
				fs.writeFile(path, DBot.pugRender('top10.pug', {
					data: output,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					title: 'Top users on ' + msg.channel.guild.name
				}), console.errHandler);
				
				msg.channel.stopTyping();
				msg.reply(pathU);
			} catch(err) {
				msg.channel.stopTyping();
				console.error(err);
				msg.reply('<internal pony error>');
			}
		});
	};
};

DBot.RegisterCommand({
	name: 'top10',
	alias: ['top', 'top20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this server',
	delay: 5,
	nopm: true,
	
	func: top10fn('top10', 'COUNT')
});

DBot.RegisterCommand({
	name: 'wtop10',
	alias: ['wtop', 'wtop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this server\nUses "Total Words said" as ranking',
	delay: 5,
	nopm: true,
	
	func: top10fn('wtop10', 'TOTAL_WORDS')
});

DBot.RegisterCommand({
	name: 'utop10',
	alias: ['utop', 'utop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this server\nUses "Total Unique Words said" as ranking',
	delay: 5,
	nopm: true,
	
	func: top10fn('utop10', 'TOTAL_UNIQUE_WORDS')
});

const gtop10fn = function(name, order) {
	return function(args, cmd, msg) {
		const page = Number.from(args[0]) || 1;
		
		if (page <= 0)
			return DBot.CommandError('what', name, args, 1);
		
		const offset = (page - 1) * 200;
		msg.channel.startTyping();
		const query = `
			SELECT
				users."UID" as "USERID",
				users."ID" as "ID",
				users."NAME" as "USERNAME",
				users."AVATAR" as "AVATAR",
				stats__generic_users."MESSAGES" as "COUNT",
				SUM(stats__words_users."COUNT") AS "TOTAL_WORDS",
				COUNT(DISTINCT stats__words_users."WORD") AS "TOTAL_UNIQUE_WORDS"
			FROM
				users,
				stats__generic_users,
				stats__words_users
			WHERE
				users."TIME" > currtime() - 120 AND
				stats__generic_users."ID" = users."ID" AND
				stats__words_users."ID" = users."ID"
			GROUP BY
				users."UID",
				users."ID",
				users."NAME",
				stats__generic_users."MESSAGES"
			ORDER BY "${order}" DESC
			OFFSET ${offset} LIMIT 200`;
		
		Postgres.query(query, function(err, data) {
			if (err) {
				console.error(err);
				msg.reply('<internal pony error>');
				msg.channel.stopTyping();
				return;
			}
			
			if (!data[0]) {
				msg.channel.stopTyping();
				msg.reply('No data was returned in query');
				return;
			}
			
			try {
				const sha = String.hash(CurTime() + '_' + msg.author.id);
				const path = DBot.WebRoot + '/stats/' + sha + '.html';
				const pathU = DBot.URLRoot + '/stats/' + sha + '.html';
				
				const output = [];
				
				let i = 0;
				
				for (const row of data) {
					const myData = {};
					output.push(myData);
					
					myData.rank = Number(i) + 1 + (page - 1) * 200;
					myData.username = row.USERNAME;
					myData.avatar = row.AVATAR || '../no_avatar.jpg';
					
					if (row.USERNAME !== row.NICKNAME)
						myData.nickname = row.NICKNAME;
					
					myData.count = numeral(row.COUNT).format('0,0');
					myData.totalw = numeral(row.TOTAL_WORDS).format('0,0');
					myData.totalwq = numeral(row.TOTAL_UNIQUE_WORDS).format('0,0');
					
					i++;
				}
				
				fs.writeFile(path, DBot.pugRender('top10.pug', {
					data: output,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: 'N/A (GLOBAL)',
					title: 'Global TOP200'
				}), console.errHandler);
				
				msg.channel.stopTyping();
				msg.reply(pathU);
			} catch(err) {
				msg.channel.stopTyping();
				console.error(err);
				msg.reply('<internal pony error>');
			}
		});
	};
};

DBot.RegisterCommand({
	name: 'gtop10',
	alias: ['gtop', 'gtop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP of talkable persons',
	delay: 5,
	
	func: gtop10fn('gtop10', 'COUNT')
});

DBot.RegisterCommand({
	name: 'gwtop10',
	alias: ['gwtop', 'gwtop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP of talkable persons on this server\nUses "Total Words said" as ranking',
	delay: 5,
	
	func: gtop10fn('gwtop10', 'TOTAL_WORDS')
});

DBot.RegisterCommand({
	name: 'gutop10',
	alias: ['gutop', 'gutop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP of talkable persons\nUses "Total Unique Words said" as ranking',
	delay: 5,
	
	func: gtop10fn('gutop10', 'TOTAL_UNIQUE_WORDS')
});

const ctop10fn = function(name, order) {
	return function(args, cmd, msg) {
		const page = Number.from(args[0]) || 1;
		
		if (page <= 0)
			return DBot.CommandError('what', 'ctop10', args, 1);
		
		const offset = (page - 1) * 200;
		const ID = DBot.GetChannelID(msg.channel);
		const query = `
			SELECT
				users."UID" as "USERID",
				users."ID" as "ID",
				users."AVATAR" as "AVATAR",
				users."NAME" as "USERNAME",
				members."NAME" as "NICKNAME",
				stats__peruser_channels."MESSAGES" as "COUNT",
				SUM(stats__uwords_channels."COUNT") AS "TOTAL_WORDS",
				COUNT(DISTINCT stats__uwords_channels."WORD") AS "TOTAL_UNIQUE_WORDS"
			FROM
				users,
				members,
				channels,
				stats__peruser_channels,
				stats__uwords_channels
			WHERE
				stats__peruser_channels."ID" = ${ID} AND
				stats__uwords_channels."ID" = ${ID} AND
				channels."ID" = ${ID} AND
				members."SERVER" = channels."SID" AND
				members."USER" = users."ID" AND
				stats__peruser_channels."USER" = users."ID" AND
				stats__uwords_channels."USER" = users."ID"
			GROUP BY
				users."UID",
				users."ID",
				members."NAME",
				stats__peruser_channels."MESSAGES"
			ORDER BY "${order}" DESC
			OFFSET ${offset} LIMIT 200`;
		
		msg.channel.startTyping();
		
		Postgres.query(query, function(err, data) {
			if (err) {
				console.error(err);
				msg.reply('<internal pony error>');
				msg.channel.stopTyping();
				return;
			}
			
			if (!data[0]) {
				msg.channel.stopTyping();
				msg.reply('No data was returned in query');
				return;
			}
			
			try {
				const sha = String.hash(CurTime() + '_' + msg.channel.guild.id + '_' + msg.author.id);
				const path = DBot.WebRoot + '/stats/' + sha + '.html';
				const pathU = DBot.URLRoot + '/stats/' + sha + '.html';
				
				const output = [];
				
				let i = 0;
				
				for (const row of data) {
					const myData = {};
					output.push(myData);
					
					myData.rank = Number(i) + 1 + (page - 1) * 200;
					myData.username = row.USERNAME;
					myData.avatar = row.AVATAR || '../no_avatar.jpg';
					
					if (row.USERNAME !== row.NICKNAME)
						myData.nickname = row.NICKNAME;
					
					myData.count = numeral(row.COUNT).format('0,0');
					myData.totalw = numeral(row.TOTAL_WORDS).format('0,0');
					myData.totalwq = numeral(row.TOTAL_UNIQUE_WORDS).format('0,0');
					
					i++;
				}
				
				fs.writeFile(path, DBot.pugRender('top10.pug', {
					data: output,
					date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
					username: msg.author.username,
					server: msg.channel.guild.name,
					title: 'Top users on #' + msg.channel.name
				}), console.errHandler);
				
				msg.channel.stopTyping();
				msg.reply(pathU);
			} catch(err) {
				msg.channel.stopTyping();
				console.error(err);
				msg.reply('<internal pony error>');
			}
		});
	};
};

DBot.RegisterCommand({
	name: 'ctop10',
	alias: ['ctop', 'ctop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this channel',
	delay: 5,
	nopm: true,
	
	func: ctop10fn('ctop10', 'COUNT')
});

DBot.RegisterCommand({
	name: 'wctop10',
	alias: ['wctop', 'wctop20', 'cwtop', 'cwtop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this channel\nUses "Total words said" as ranking',
	delay: 5,
	nopm: true,
	
	func: ctop10fn('wctop10', 'TOTAL_WORDS')
});

DBot.RegisterCommand({
	name: 'uctop10',
	alias: ['uctop', 'uctop20', 'cutop', 'cutop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this channel\nUses "Total unique words said" as ranking',
	delay: 5,
	nopm: true,
	
	func: ctop10fn('uctop10', 'TOTAL_UNIQUE_WORDS')
});


Util.mkdir(DBot.WebRoot + '/ntstats');
const fs = require('fs');

DBot.RegisterCommand({
	name: 'nevertalked',
	alias: ['nevertalk', 'newbies', 'newbie', 'voicelesses', 'speechlesses', 'silents', 'inactive'],
	
	help_args: '[prune]',
	desc: 'Lists all users that don\'t talk\nIf first argument is "prune", it will kick **all** users',
	delay: 5,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		msg.channel.startTyping();
		
		if (args[0] !== 'prune') {
			Postgres.query(sprintf(never_talk_sql, DBot.bot.user.id, msg.channel.guild.uid, msg.channel.guild.uid), function(err, data) {
				msg.channel.stopTyping();
				
				if (err) {
					msg.reply('<internal pony error>');
					console.error(err);
					return;
				}
				
				let sha = String.hash(CurTime() + '_' + msg.channel.guild.uid);
				let stream = fs.createWriteStream(DBot.WebRoot + '/ntstats/' + sha + '.txt');
				
				stream.write('Table of users\n');
				
				for (let row of data) {
					stream.write('\t <@' + row.USERID + '> ' + String.appendSpaces(row.MEMBERNAME, 60) + '(' + row.USERNAME + ')\n');
				}
				
				stream.write('\n\nArray of users\n\t');
				
				let i = 0;
				
				for (let row of data) {
					i++;
					stream.write('<@' + row.USERID + '> ');
					
					if (i >= 40) {
						i = 0;
						stream.write('\n\t');
					}
				}
				
				stream.write('\n\nArray of users (single line)\n');
				
				for (let row of data) {
					stream.write('<@' + row.USERID + '> ');
				}
				
				stream.write('\n\nArray of names\n\t');
				
				i = 0;
				
				for (let row of data) {
					stream.write(row.MEMBERNAME + ' ');
					
					if (i >= 40) {
						i = 0;
						stream.write('\n\t');
					}
				}
				
				stream.write('\n\nArray of names (single line)\n');
				
				for (let row of data) {
					stream.write(row.MEMBERNAME + ' ');
				}
				
				
				stream.write('\n\nArrays, but with forward @\n\t');
				stream.write('\n\nArray of names\n\t');
				
				i = 0;
				
				for (let row of data) {
					stream.write('@' + row.MEMBERNAME + ' ');
					
					if (i >= 40) {
						i = 0;
						stream.write('\n\t');
					}
				}
				
				stream.write('\n\nArray of names (single line)\n');
				
				for (let row of data) {
					stream.write('@' + row.MEMBERNAME + ' ');
				}
				
				stream.end();
				
				stream.on('finish', function() {
					msg.reply(DBot.URLRoot + '/ntstats/' + sha + '.txt');
				});
			});
		} else {
			let me = msg.channel.guild.member(DBot.bot.user);
			
			if (!me) {
				msg.reply('<internal pony error>');
				return;
			}
			
			if (!msg.member.hasPermission('KICK_MEMBERS'))
				return 'You must have `KICK_MEMBERS` permission ;n;';
			
			if (!me.hasPermission('KICK_MEMBERS'))
				return 'I must have `KICK_MEMBERS` permission ;n;';
			
			Postgres.query(sprintf(never_talk_sql, DBot.bot.user.id, msg.channel.guild.uid, msg.channel.guild.uid), function(err, data) {
				msg.channel.stopTyping();
				
				if (err) {
					msg.reply('<internal pony error>');
					console.error(err);
					return;
				}
				
				if (!data[0]) {
					msg.reply('No users to kick');
					return;
				}
				
				let found = [];
				let server = msg.channel.guild;
				
				for (let row of data) {
					let member = server.member(row.USERID);
					
					if (member && member.kickable)
						found.push(member);
				}
				
				if (!found[0]) {
					msg.reply('No users to kick');
					return;
				}
				
				let conf = new DBot.Confirm(msg.author, msg.channel);
				
				conf.setTitle('Server members prune');
				conf.setDesc('Kick **' + found.length + '** not talking members');
				
				conf.confirm(function() {
					msg.channel.startTyping();
					msg.reply('Kicking **' + found.length + '** members ;n; Bye ;n;');
					
					let total = found.length;
					
					for (let member of found) {
						member.kick()
						.then(function() {
							total--;
							
							if (total === 0) {
								msg.channel.stopTyping();
								msg.reply('All members are kicked now ;n;');
							}
						})
						.catch(function() {
							total--;
							
							if (total === 0) {
								msg.channel.stopTyping();
								msg.reply('All members are kicked now ;n;');
							}
						});
					}
				});
				
				conf.decline(function() {
					msg.reply('Aborting');
				});
				
				conf.echo();
			});
		}
	}
});

let getsfn = function(name, num) {
	return function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		msg.channel.startTyping();
		
		let mode = (args[0] || 'server').toLowerCase();
		let mode1 = (args[1] || '').toLowerCase();
		
		if (mode === 'server') {
			let fuckingQuery = `
			SELECT
				members."NAME" AS "NAME",
				stats__server_get."NUMBER" AS "NUMBER",
				stats__server_get."STAMP" AS "STAMP"
			FROM
				members,
				stats__server_get
			WHERE
				stats__server_get."NUMBER" % ${num} = 0 AND
				members."ID" = stats__server_get."MEMBER" AND
				members."SERVER" = ${msg.channel.guild.uid}
			ORDER BY
				stats__server_get."ENTRY" DESC
			LIMIT 10
			`;
			
			Postgres.query(fuckingQuery, function(err, data) {
				msg.channel.stopTyping();
				
				if (err) {
					msg.reply('What the fuck');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No gets ;n;');
					return;
				}
				
				let output = '```' + String.appendSpaces('Username', 30) + String.appendSpaces('Get', 10) + String.appendSpaces('Date', 10) + '\n';
				
				for (let row of data) {
					output += String.appendSpaces(row.NAME, 30) + String.appendSpaces(numeral(row.NUMBER * 1000).format('0,0'), 10) + String.appendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ')', 10) + '\n';
				}
				
				msg.reply(output + '```');
			});
		} else if (mode === 'image' || mode === 'images' || mode === 'server' && (mode1 === 'image' || mode1 === 'images')) {
			let fuckingQuery = `
			SELECT
				members."NAME" AS "NAME",
				stats__server_get_image."NUMBER" AS "NUMBER",
				stats__server_get_image."STAMP" AS "STAMP"
			FROM
				members,
				stats__server_get_image
			WHERE
				stats__server_get_image."NUMBER" % ${num} = 0 AND
				members."ID" = stats__server_get_image."MEMBER" AND
				members."SERVER" = ${msg.channel.guild.uid}
			ORDER BY
				stats__server_get_image."ENTRY" DESC
			LIMIT 10
			`;
			
			Postgres.query(fuckingQuery, function(err, data) {
				msg.channel.stopTyping();
				
				if (err) {
					msg.reply('What the fuck');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No gets ;n;');
					return;
				}
				
				let output = '```' + String.appendSpaces('Username', 30) + String.appendSpaces('Get', 10) + String.appendSpaces('Date', 10) + '\n';
				
				for (let row of data) {
					output += String.appendSpaces(row.NAME, 30) + String.appendSpaces(numeral(row.NUMBER * 100).format('0,0'), 10) + String.appendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 100) + ')', 10) + '\n';
				}
				
				msg.reply(output + '```');
			});
		} else if (mode === 'channel') {
			let fuckingQuery = `
			SELECT
				members."NAME" AS "NAME",
				stats__channel_get."NUMBER" AS "NUMBER",
				stats__channel_get."STAMP" AS "STAMP"
			FROM
				members,
				stats__channel_get
			WHERE
				stats__channel_get."NUMBER" % ${num} = 0 AND
				stats__channel_get."ID" = ${msg.channel.uid} AND
				members."ID" = stats__channel_get."MEMBER" AND
				members."SERVER" = ${msg.channel.guild.uid}
			ORDER BY
				stats__server_get_image."ENTRY" DESC
			LIMIT 10
			`;
			
			Postgres.query(fuckingQuery, function(err, data) {
				msg.channel.stopTyping();
				
				if (err) {
					msg.reply('What the fuck');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No gets ;n;');
					return;
				}
				
				let output = '```' + String.appendSpaces('Username', 30) + String.appendSpaces('Get', 10) + String.appendSpaces('Date', 10) + '\n';
				
				for (let row of data) {
					output += String.appendSpaces(row.NAME, 30) + String.appendSpaces(numeral(row.NUMBER * 1000).format('0,0'), 10) + String.appendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ')', 10) + '\n';
				}
				
				msg.reply(output + '```');
			});
		} else if (mode === 'channel' && (mode1 === 'image' || mode1 === 'images')) {
			let fuckingQuery = `
			SELECT
				members."NAME" AS "NAME",
				stats__channel_get_image."NUMBER" AS "NUMBER",
				stats__channel_get_image."STAMP" AS "STAMP"
			FROM
				members,
				stats__channel_get_image
			WHERE
				stats__channel_get_image."NUMBER" % ${num} = 0 AND
				stats__channel_get_image."ID" = ${msg.channel.uid} AND
				members."ID" = stats__channel_get_image."MEMBER" AND
				members."SERVER" = ${msg.channel.guild.uid}
			ORDER BY
				stats__server_get_image."ENTRY" DESC
			LIMIT 10
			`;
			
			Postgres.query(fuckingQuery, function(err, data) {
				msg.channel.stopTyping();
				
				if (err) {
					msg.reply('What the fuck');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No gets ;n;');
					return;
				}
				
				let output = '```' + String.appendSpaces('Username', 30) + String.appendSpaces('Get', 10) + String.appendSpaces('Date', 10) + '\n';
				
				for (let row of data) {
					output += String.appendSpaces(row.NAME, 30) + String.appendSpaces(numeral(row.NUMBER * num * 100).format('0,0'), 10) + String.appendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * num * 100) + ')', 10) + '\n';
				}
				
				msg.reply(output + '```');
			});
		} else {
			return DBot.CommandError('Unknown subcommand', name, args, 1);
		}
	};
};

let descFullGet = `
Submodes are:
server
image or server images
channel
channel images
`;

DBot.RegisterCommand({
	name: 'gets',
	
	help_args: '',
	desc: 'Users who GET a round message',
	delay: 5,
	desc_full: descFullGet,
	
	func: getsfn('gets', 1)
});

DBot.RegisterCommand({
	name: 'gets5',
	
	help_args: '',
	desc: 'Users who GET a round message (5k)',
	delay: 5,
	desc_full: descFullGet,
	
	func: getsfn('gets', 5)
});


let word_global_sql = `
SELECT
	stats__words_db."WORD",
	stats__words_db."COUNT" AS "SUM"
FROM
	stats__words_db
WHERE
	TRIM(stats__words_db."WORD") != ''
ORDER BY
	"SUM" DESC
LIMIT 20
`;

let word_sql = `
SELECT
	stats__words_db."WORD",
	SUM(stats__words_users."COUNT") AS "SUM"
FROM
	stats__words_users,
	stats__words_db
WHERE
	stats__words_users."ID" = %i AND
	TRIM(stats__words_db."WORD") != '' AND
	stats__words_db."ID" = stats__words_users."WORD"
GROUP BY
	stats__words_users."WORD",
	stats__words_db."WORD"
ORDER BY
	"SUM" DESC
LIMIT 20
`;

let word_server_sql = `
SELECT
	stats__words_db."WORD",
	SUM(stats__words_servers."COUNT") AS "SUM"
FROM
	stats__words_servers,
	stats__words_db
WHERE
	stats__words_servers."ID" = %i AND
	TRIM(stats__words_db."WORD") != '' AND
	stats__words_db."ID" = stats__words_servers."WORD"
GROUP BY
	stats__words_servers."WORD",
	stats__words_db."WORD"
ORDER BY
	"SUM" DESC
LIMIT 20
`;

let word_server_sql_user = `
SELECT
	stats__words_db."WORD",
	SUM(stats__uwords_servers."COUNT") AS "SUM"
FROM
	stats__uwords_servers,
	stats__words_db
WHERE
	stats__uwords_servers."ID" = %i AND
	stats__uwords_servers."USER" = %i AND
	TRIM(stats__words_db."WORD") != '' AND
	stats__words_db."ID" = stats__uwords_servers."WORD"
GROUP BY
	stats__uwords_servers."WORD",
	stats__words_db."WORD"
ORDER BY
	"SUM" DESC
LIMIT 20
`;

let word_channel_sql = `
SELECT
	stats__words_db."WORD",
	SUM(stats__words_channels."COUNT") AS "SUM"
FROM
	stats__words_channels
WHERE
	stats__words_channels."ID" = %i AND
	TRIM(stats__words_db."WORD") != '' AND
	stats__words_db."ID" = stats__words_channels."WORD"
GROUP BY
	stats__words_channels."WORD",
	stats__words_db."WORD"
ORDER BY
	"SUM" DESC
LIMIT 20
`;

let word_channel_sql_user = `
SELECT
	stats__words_db."WORD",
	SUM(stats__uwords_channels."COUNT") AS "SUM"
FROM
	stats__uwords_channels
WHERE
	stats__uwords_channels."ID" = %i AND
	stats__uwords_channels."USER" = %i AND
	TRIM(stats__words_db."WORD") != '' AND
	stats__words_db."ID" = stats__uwords_channels."WORD"
GROUP BY
	stats__uwords_channels."WORD",
	stats__words_db."WORD"
ORDER BY
	"SUM" DESC
LIMIT 20
`;

DBot.RegisterCommand({
	name: 'wsstats',
	alias: ['wordsstats', 'wordserverstats', 'serverwordstats', 'swstats'],
	
	help_args: '[user]',
	desc: 'Word server statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		let id = msg.author.uid;
		
		msg.channel.startTyping();
		
		if (typeof args[0] !== 'object') {
			Postgres.query(sprintf(word_server_sql, msg.channel.guild.uid), function(err1, gdata) {
				Postgres.query(sprintf(word_server_sql_user, msg.channel.guild.uid, msg.author.uid), function(err2, udata) {
					msg.channel.stopTyping();
					
					if (err1) {
						msg.reply('<internal pony error>');
						console.error(err1);
						return;
					}
					
					if (err2) {
						msg.reply('<internal pony error>');
						console.error(err2);
						return;
					}
					
					let output = String.appendSpaces('Word', 25) + String.appendSpaces('Count', 6) + '\n```\n';
					
					output += '----- Server\n';
					
					for (let row of gdata) {
						output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					output += '----- Your\n';
					
					for (let row of udata) {
						output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					msg.reply(output + '\n```');
				});
			});
		} else {
			Postgres.query(sprintf(word_server_sql_user, msg.channel.guild.uid, args[0].uid), function(err2, udata) {
				msg.channel.stopTyping();
				
				if (err2) {
					msg.reply('<internal pony error>');
					console.error(err2);
					return;
				}
				
				let output = String.appendSpaces('Word', 25) + String.appendSpaces('Count', 6) + '\n```\n';
				
				output += '----- His\n';
				
				for (let row of udata) {
					output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
				}
				
				msg.reply(output + '\n```');
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'wcstats',
	alias: ['wordcstats', 'wordchannelstats', 'channelwordstats', 'cwstats'],
	
	help_args: '[user]',
	desc: 'Word channel statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'pm ;n;';
		
		let id = msg.author.uid;
		
		msg.channel.startTyping();
		
		if (typeof args[0] !== 'object') {
			Postgres.query(sprintf(word_channel_sql, msg.channel.uid), function(err1, gdata) {
				Postgres.query(sprintf(word_channel_sql_user, msg.channel.uid, msg.author.uid), function(err2, udata) {
					msg.channel.stopTyping();
					
					if (err1) {
						msg.reply('<internal pony error>');
						console.error(err1);
						return;
					}
					
					if (err2) {
						msg.reply('<internal pony error>');
						console.error(err2);
						return;
					}
					
					let output = String.appendSpaces('Word', 25) + String.appendSpaces('Count', 6) + '\n```\n';
					
					output += '----- Channel\n';
					
					for (let row of gdata) {
						output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					output += '----- Your\n';
					
					for (let row of udata) {
						output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					msg.reply(output + '\n```');
				});
			});
		} else {
			Postgres.query(sprintf(word_channel_sql_user, msg.channel.uid, args[0].uid), function(err2, udata) {
				msg.channel.stopTyping();
				
				if (err2) {
					msg.reply('<internal pony error>');
					console.error(err2);
					return;
				}
				
				let output = String.appendSpaces('Word', 25) + String.appendSpaces('Count', 6) + '\n```\n';
				
				output += '----- His\n';
				
				for (let row of udata) {
					output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
				}
				
				msg.reply(output + '\n```');
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'wstats',
	alias: ['wordstats'],
	
	help_args: '[user]',
	desc: 'Word global statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let id = msg.author.uid;
		
		msg.channel.startTyping();
		
		if (typeof args[0] !== 'object') {
			Postgres.query(word_global_sql, function(err1, gdata) {
				Postgres.query(sprintf(word_sql, id), function(err2, udata) {
					msg.channel.stopTyping();
					
					if (err1) {
						msg.reply('<internal pony error>');
						console.error(err1);
						return;
					}
					
					if (err2) {
						msg.reply('<internal pony error>');
						console.error(err2);
						return;
					}
					
					let output = String.appendSpaces('Word', 25) + String.appendSpaces('Count', 6) + '\n```\n';
					
					output += '----- Global\n';
					
					for (let row of gdata) {
						output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					output += '----- Your\n';
					
					for (let row of udata) {
						output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					msg.reply(output + '\n```');
				});
			});
		} else {
			Postgres.query(sprintf(word_sql, id), function(err2, udata) {
				msg.channel.stopTyping();
				
				if (err2) {
					msg.reply('<internal pony error>');
					console.error(err2);
					return;
				}
				
				let output = String.appendSpaces('Word', 25) + String.appendSpaces('Count', 6) + '\n```\n';
				
				output += '----- His\n';
				
				for (let row of udata) {
					output += String.appendSpaces(row.WORD.substr(0, 20), 25) + String.appendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
				}
				
				msg.reply(output + '\n```');
			});
		}
	}
});

const global_stats_query = `
WITH most_used_command AS (
	SELECT
		"COMMAND",
		SUM("COUNT") AS "COUNT"
	FROM
		stats__command_users,
		users
	WHERE
		users."TIME" > currtime() - 120 AND
		stats__command_users."ID" = users."ID"
	GROUP BY
		"COMMAND"
	ORDER BY
		"COUNT" DESC
	LIMIT 1
),

words_count AS (
	SELECT
		SUM("COUNT") AS "COUNT"
	FROM
		stats__words_db
),

words_unique AS (
	SELECT
		COUNT(*) AS "UNIQUE"
	FROM
		stats__words_db
)

SELECT
	SUM("CHARS") AS "TotalChars",
	SUM("MESSAGES") AS "TotalMessages",
	SUM("MESSAGES_E") AS "TotalMessagesEdited",
	SUM("MESSAGES_D") AS "TotalMessagesDeleted",
	SUM("IMAGES") AS "TotalImagesSent",
	SUM("TYPINGS") AS "TotalTypings",
	(SELECT "COMMAND" FROM most_used_command) AS "MostCommandUsed",
	(SELECT "UNIQUE" FROM words_unique) AS "UniqueWords",
	(SELECT "COUNT" FROM words_count) AS "WordsSaid",
	(SELECT "COUNT" FROM most_used_command) AS "MostCommandUsedCount"
FROM
	stats__generic_users,
	users
WHERE
	users."TIME" > currtime() - 120 AND
	stats__generic_users."ID" = users."ID"
`;

const formatNumberFunc = function(num) {
	return numeral(num).format('0,0');
};

DBot.RegisterCommand({
	name: 'stats',
	alias: ['globalstats'],
	
	help_args: '[user]',
	desc: 'Global statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let id = DBot.GetUserID(msg.author);
		let nick = msg.author.username;
		let hideGlobal = false;
		
		if (typeof args[0] === 'object') {
			id = DBot.GetUserID(args[0]);
			nick = args[0].username;
			hideGlobal = true;
		}
		
		msg.channel.startTyping();
		
		const stats_query = `
			WITH most_used_command AS (
				SELECT
					"COMMAND",
					SUM("COUNT") AS "COUNT"
				FROM
					stats__command_users
				WHERE
					"ID" = ${id}
				GROUP BY
					"COMMAND"
				ORDER BY
					"COUNT" DESC
				LIMIT 1
			),

			words_count AS (
				SELECT
					SUM("COUNT") AS "COUNT"
				FROM
					stats__words_users
				WHERE
					"ID" = ${id}
			),

			words_unique AS (
				SELECT
					COUNT(*) AS "UNIQUE"
				FROM
					stats__words_users
				WHERE
					"ID" = ${id}
			)

			SELECT
				"CHARS" AS "TotalChars",
				"MESSAGES" AS "TotalMessages",
				"MESSAGES_E" AS "TotalMessagesEdited",
				"MESSAGES_D" AS "TotalMessagesDeleted",
				"IMAGES" AS "TotalImagesSent",
				"TYPINGS" AS "TotalTypings",
				(SELECT "COMMAND" FROM most_used_command) AS "MostCommandUsed",
				(SELECT "UNIQUE" FROM words_unique) AS "UniqueWords",
				(SELECT "COUNT" FROM words_count) AS "WordsSaid",
				(SELECT "COUNT" FROM most_used_command) AS "MostCommandUsedCount"
			FROM
				stats__generic_users
			WHERE
				"ID" = ${id}
			`;
		
		const funcCallback = function(userData, data) {
			let output = '```';
			
			if (!hideGlobal) {
				output += '\nTotal servers:                   ' + formatNumberFunc(DBot.bot.guilds.size);
				output += '\nTotal channels:                  ' + formatNumberFunc(DBot.bot.channels.size);
				output += '\nTotal users:                     ' + formatNumberFunc(DBot.GetMembers().length);
				output += '\nTotal unique users:              ' + formatNumberFunc(DBot.GetUsers().length);
				output += '\n------ Global statistics';
				output += '\nTotal chars printed:             ' + formatNumberFunc(data[0].TotalChars);
				output += '\nTotal messages sent:             ' + formatNumberFunc(data[0].TotalMessages);
				output += '\nTotal words said:                ' + formatNumberFunc(data[0].WordsSaid);
				output += '\nTotal unqiue words said:         ' + formatNumberFunc(data[0].UniqueWords);
				output += '\nTotal messages edited:           ' + formatNumberFunc(data[0].TotalMessagesEdited);
				output += '\nTotal messages deleted:          ' + formatNumberFunc(data[0].TotalMessagesDeleted);
				output += '\nTotal images sent:               ' + formatNumberFunc(data[0].TotalImagesSent);
				output += '\nTotal "typing" starts:           ' + formatNumberFunc(data[0].TotalTypings);
				output += '\nMost command used:               ' + data[0].MostCommandUsed;
				output += '\nUsed times:                      ' + formatNumberFunc(data[0].MostCommandUsedCount);
			}
			
			output += '\n------ @' + nick + ' statistics';
			output += '\nTotal chars printed:             ' + formatNumberFunc(userData[0].TotalChars);
			output += '\nTotal messages sent:             ' + formatNumberFunc(userData[0].TotalMessages);
			output += '\nTotal words said:                ' + formatNumberFunc(userData[0].WordsSaid);
			output += '\nTotal unqiue words said:         ' + formatNumberFunc(userData[0].UniqueWords);
			output += '\nTotal messages edited:           ' + formatNumberFunc(userData[0].TotalMessagesEdited);
			output += '\nTotal messages deleted:          ' + formatNumberFunc(userData[0].TotalMessagesDeleted);
			output += '\nTotal images sent:               ' + formatNumberFunc(userData[0].TotalImagesSent);
			output += '\nTotal "typing" starts:           ' + formatNumberFunc(userData[0].TotalTypings);
			output += '\nMost command used:               ' + userData[0].MostCommandUsed;
			output += '\nUsed times:                      ' + formatNumberFunc(userData[0].MostCommandUsedCount);
			
			msg.channel.stopTyping();
			msg.reply(output + '\n```');
		};
		
		if (!hideGlobal) {
			Postgres.query(stats_query, function(err1, userData) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				Postgres.query(global_stats_query, function(err2, data) {
					if (err2) {
						console.log(err2);
						msg.reply('<internal pony error>');
						msg.channel.stopTyping();
						return;
					}
					
					funcCallback(userData, data);
				});
			});
		} else {
			Postgres.query(stats_query, function(err1, userData) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				funcCallback(userData);
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'sstats',
	alias: ['serverstats'],
	
	help_args: '[user]',
	desc: 'Server statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;n;';
		
		let id = DBot.GetUserID(msg.author);
		let serverid = DBot.GetServerID(msg.channel.guild);
		let nick = msg.author.username;
		let hideGlobal = false;
		
		if (typeof args[0] === 'object') {
			id = DBot.GetUserID(args[0]);
			nick = args[0].username;
			hideGlobal = true;
		}
		
		msg.channel.startTyping();
		
		const stats_query = `
			WITH most_used_command AS (
				SELECT
					"COMMAND",
					SUM("COUNT") AS "COUNT"
				FROM
					stats__ucommand_servers
				WHERE
					"ID" = ${serverid} AND
					"USER" = ${id}
				GROUP BY
					"COMMAND"
				ORDER BY
					"COUNT" DESC
				LIMIT 1
			),

			words_count AS (
				SELECT
					SUM("COUNT") AS "COUNT"
				FROM
					stats__uwords_servers
				WHERE
					"ID" = ${serverid} AND
					"USER" = ${id}
			),

			words_unique AS (
				SELECT
					COUNT(*) AS "UNIQUE"
				FROM
					stats__uwords_servers
				WHERE
					"ID" = ${serverid} AND
					"USER" = ${id}
			)

			SELECT
				"CHARS" AS "TotalChars",
				"MESSAGES" AS "TotalMessages",
				"MESSAGES_E" AS "TotalMessagesEdited",
				"MESSAGES_D" AS "TotalMessagesDeleted",
				"IMAGES" AS "TotalImagesSent",
				"TYPINGS" AS "TotalTypings",
				(SELECT "COMMAND" FROM most_used_command) AS "MostCommandUsed",
				(SELECT "UNIQUE" FROM words_unique) AS "UniqueWords",
				(SELECT "COUNT" FROM words_count) AS "WordsSaid",
				(SELECT "COUNT" FROM most_used_command) AS "MostCommandUsedCount"
			FROM
				stats__peruser_servers
			WHERE
				"ID" = ${serverid} AND
				"USER" = ${id}
			`;
		
		const server_stats_query = `
			WITH most_used_command AS (
				SELECT
					"COMMAND",
					SUM("COUNT") AS "COUNT"
				FROM
					stats__command_servers
				WHERE
					"ID" = ${serverid}
				GROUP BY
					"COMMAND"
				ORDER BY
					"COUNT" DESC
				LIMIT 1
			),

			words_count AS (
				SELECT
					SUM("COUNT") AS "COUNT"
				FROM
					stats__words_servers
				WHERE
					"ID" = ${serverid}
			),

			words_unique AS (
				SELECT
					COUNT(*) AS "UNIQUE"
				FROM
					stats__words_servers
				WHERE
					"ID" = ${serverid}
			)

			SELECT
				SUM("CHARS") AS "TotalChars",
				SUM("MESSAGES") AS "TotalMessages",
				SUM("MESSAGES_E") AS "TotalMessagesEdited",
				SUM("MESSAGES_D") AS "TotalMessagesDeleted",
				SUM("IMAGES") AS "TotalImagesSent",
				SUM("TYPINGS") AS "TotalTypings",
				(SELECT "COMMAND" FROM most_used_command) AS "MostCommandUsed",
				(SELECT "UNIQUE" FROM words_unique) AS "UniqueWords",
				(SELECT "COUNT" FROM words_count) AS "WordsSaid",
				(SELECT "COUNT" FROM most_used_command) AS "MostCommandUsedCount"
			FROM
				stats__generic_servers
			WHERE
				"ID" = ${serverid}
			`;
		
		const funcCallback = function(userData, data) {
			let output = '```';
			
			if (!hideGlobal) {
				output += '\n------ Server statistics';
				output += '\nTotal chars printed:             ' + formatNumberFunc(data[0].TotalChars);
				output += '\nTotal messages sent:             ' + formatNumberFunc(data[0].TotalMessages);
				output += '\nTotal words said:                ' + formatNumberFunc(data[0].WordsSaid);
				output += '\nTotal unqiue words said:         ' + formatNumberFunc(data[0].UniqueWords);
				output += '\nTotal messages edited:           ' + formatNumberFunc(data[0].TotalMessagesEdited);
				output += '\nTotal messages deleted:          ' + formatNumberFunc(data[0].TotalMessagesDeleted);
				output += '\nTotal images sent:               ' + formatNumberFunc(data[0].TotalImagesSent);
				output += '\nTotal "typing" starts:           ' + formatNumberFunc(data[0].TotalTypings);
				output += '\nMost command used:               ' + data[0].MostCommandUsed;
				output += '\nUsed times:                      ' + formatNumberFunc(data[0].MostCommandUsedCount);
			}
			
			output += '\n------ @' + nick + ' statistics';
			output += '\nTotal chars printed:             ' + formatNumberFunc(userData[0].TotalChars);
			output += '\nTotal messages sent:             ' + formatNumberFunc(userData[0].TotalMessages);
			output += '\nTotal words said:                ' + formatNumberFunc(userData[0].WordsSaid);
			output += '\nTotal unqiue words said:         ' + formatNumberFunc(userData[0].UniqueWords);
			output += '\nTotal messages edited:           ' + formatNumberFunc(userData[0].TotalMessagesEdited);
			output += '\nTotal messages deleted:          ' + formatNumberFunc(userData[0].TotalMessagesDeleted);
			output += '\nTotal images sent:               ' + formatNumberFunc(userData[0].TotalImagesSent);
			output += '\nTotal "typing" starts:           ' + formatNumberFunc(userData[0].TotalTypings);
			output += '\nMost command used:               ' + userData[0].MostCommandUsed;
			output += '\nUsed times:                      ' + formatNumberFunc(userData[0].MostCommandUsedCount);
			
			msg.channel.stopTyping();
			msg.reply(output + '\n```');
		};
		
		if (!hideGlobal) {
			Postgres.query(stats_query, function(err1, userData) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				Postgres.query(server_stats_query, function(err2, data) {
					if (err2) {
						console.log(err2);
						msg.reply('<internal pony error>');
						msg.channel.stopTyping();
						return;
					}
					
					funcCallback(userData, data);
				});
			});
		} else {
			Postgres.query(stats_query, function(err1, userData) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				funcCallback(userData);
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'cstats',
	alias: ['channelstats'],
	
	help_args: '[user]',
	desc: 'Channel statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;n;';
		
		let id = DBot.GetUserID(msg.author);
		let channelid = DBot.GetChannelID(msg.channel);
		let nick = msg.author.username;
		let hideGlobal = false;
		
		if (typeof args[0] === 'object') {
			id = DBot.GetUserID(args[0]);
			nick = args[0].username;
			hideGlobal = true;
		}
		
		msg.channel.startTyping();
		
		const stats_query = `
			WITH most_used_command AS (
				SELECT
					"COMMAND",
					SUM("COUNT") AS "COUNT"
				FROM
					stats__ucommand_channels
				WHERE
					"ID" = ${channelid} AND
					"USER" = ${id}
				GROUP BY
					"COMMAND"
				ORDER BY
					"COUNT" DESC
				LIMIT 1
			),

			words_count AS (
				SELECT
					SUM("COUNT") AS "COUNT"
				FROM
					stats__uwords_channels
				WHERE
					"ID" = ${channelid} AND
					"USER" = ${id}
			),

			words_unique AS (
				SELECT
					COUNT(*) AS "UNIQUE"
				FROM
					stats__uwords_channels
				WHERE
					"ID" = ${channelid} AND
					"USER" = ${id}
			)

			SELECT
				"CHARS" AS "TotalChars",
				"MESSAGES" AS "TotalMessages",
				"MESSAGES_E" AS "TotalMessagesEdited",
				"MESSAGES_D" AS "TotalMessagesDeleted",
				"IMAGES" AS "TotalImagesSent",
				"TYPINGS" AS "TotalTypings",
				(SELECT "COMMAND" FROM most_used_command) AS "MostCommandUsed",
				(SELECT "UNIQUE" FROM words_unique) AS "UniqueWords",
				(SELECT "COUNT" FROM words_count) AS "WordsSaid",
				(SELECT "COUNT" FROM most_used_command) AS "MostCommandUsedCount"
			FROM
				stats__peruser_channels
			WHERE
				"ID" = ${channelid} AND
				"USER" = ${id}
			`;
		
		const channel_stats_query = `
			WITH most_used_command AS (
				SELECT
					"COMMAND",
					SUM("COUNT") AS "COUNT"
				FROM
					stats__command_channels
				WHERE
					"ID" = ${channelid}
				GROUP BY
					"COMMAND"
				ORDER BY
					"COUNT" DESC
				LIMIT 1
			),

			words_count AS (
				SELECT
					SUM("COUNT") AS "COUNT"
				FROM
					stats__words_channels
				WHERE
					"ID" = ${channelid}
			),

			words_unique AS (
				SELECT
					COUNT(*) AS "UNIQUE"
				FROM
					stats__words_channels
				WHERE
					"ID" = ${channelid}
			)

			SELECT
				SUM("CHARS") AS "TotalChars",
				SUM("MESSAGES") AS "TotalMessages",
				SUM("MESSAGES_E") AS "TotalMessagesEdited",
				SUM("MESSAGES_D") AS "TotalMessagesDeleted",
				SUM("IMAGES") AS "TotalImagesSent",
				SUM("TYPINGS") AS "TotalTypings",
				(SELECT "COMMAND" FROM most_used_command) AS "MostCommandUsed",
				(SELECT "UNIQUE" FROM words_unique) AS "UniqueWords",
				(SELECT "COUNT" FROM words_count) AS "WordsSaid",
				(SELECT "COUNT" FROM most_used_command) AS "MostCommandUsedCount"
			FROM
				stats__generic_channels
			WHERE
				"ID" = ${channelid}
			`;
		
		const funcCallback = function(userData, data) {
			let output = '```';
			
			if (!hideGlobal) {
				output += '\n------ Channel statistics';
				output += '\nTotal chars printed:             ' + formatNumberFunc(data[0].TotalChars);
				output += '\nTotal messages sent:             ' + formatNumberFunc(data[0].TotalMessages);
				output += '\nTotal words said:                ' + formatNumberFunc(data[0].WordsSaid);
				output += '\nTotal unqiue words said:         ' + formatNumberFunc(data[0].UniqueWords);
				output += '\nTotal messages edited:           ' + formatNumberFunc(data[0].TotalMessagesEdited);
				output += '\nTotal messages deleted:          ' + formatNumberFunc(data[0].TotalMessagesDeleted);
				output += '\nTotal images sent:               ' + formatNumberFunc(data[0].TotalImagesSent);
				output += '\nTotal "typing" starts:           ' + formatNumberFunc(data[0].TotalTypings);
				output += '\nMost command used:               ' + data[0].MostCommandUsed;
				output += '\nUsed times:                      ' + formatNumberFunc(data[0].MostCommandUsedCount);
			}
			
			output += '\n------ @' + nick + ' statistics';
			output += '\nTotal chars printed:             ' + formatNumberFunc(userData[0].TotalChars);
			output += '\nTotal messages sent:             ' + formatNumberFunc(userData[0].TotalMessages);
			output += '\nTotal words said:                ' + formatNumberFunc(userData[0].WordsSaid);
			output += '\nTotal unqiue words said:         ' + formatNumberFunc(userData[0].UniqueWords);
			output += '\nTotal messages edited:           ' + formatNumberFunc(userData[0].TotalMessagesEdited);
			output += '\nTotal messages deleted:          ' + formatNumberFunc(userData[0].TotalMessagesDeleted);
			output += '\nTotal images sent:               ' + formatNumberFunc(userData[0].TotalImagesSent);
			output += '\nTotal "typing" starts:           ' + formatNumberFunc(userData[0].TotalTypings);
			output += '\nMost command used:               ' + userData[0].MostCommandUsed;
			output += '\nUsed times:                      ' + formatNumberFunc(userData[0].MostCommandUsedCount);
			
			msg.channel.stopTyping();
			msg.reply(output + '\n```');
		};
		
		if (!hideGlobal) {
			Postgres.query(stats_query, function(err1, userData) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				Postgres.query(channel_stats_query, function(err2, data) {
					if (err2) {
						console.log(err2);
						msg.reply('<internal pony error>');
						msg.channel.stopTyping();
						return;
					}
					
					funcCallback(userData, data);
				});
			});
		} else {
			Postgres.query(stats_query, function(err1, userData) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				funcCallback(userData);
			});
		}
	}
});

const command_stats_query = `
SELECT
	"COMMAND",
	SUM("COUNT") AS "CALLED_TIMES"
FROM
	stats__command_users
WHERE
	"COMMAND" != 'more' AND
	"COMMAND" != 'retry'
GROUP BY
	"COMMAND"
ORDER BY "CALLED_TIMES" DESC LIMIT 10
`;

DBot.RegisterCommand({
	name: 'commandstats',
	alias: ['commstats', 'commandsstats'],
	
	help_args: '[user]',
	desc: 'Global command usage statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		msg.channel.startTyping();
		
		let id = DBot.GetUserID(msg.author);
		let nick = msg.author.username;
		let hideGlobal = false;
		
		if (typeof args[0] === 'object') {
			id = DBot.GetUserID(args[0]);
			nick = args[0].username;
			hideGlobal = true;
		}
		
		const query = `
			SELECT
				"COMMAND",
				SUM("COUNT") AS "CALLED_TIMES"
			FROM
				stats__command_users
			WHERE
				"COMMAND" != 'more' AND
				"COMMAND" != 'retry' AND
				"ID" = ${id}
			GROUP BY
				"COMMAND"
			ORDER BY "CALLED_TIMES" DESC LIMIT 10
		`;
		
		const callback = function(userData, data) {
			let output = '```';
			
			if (!hideGlobal) {
				output += '\n------ Global command usage statistics';
				
				for (let row of data) {
					output += '\n' + String.appendSpaces(row.COMMAND, 20) + formatNumberFunc(row.CALLED_TIMES);
				}
			}
			
			output += '\n------ @' + nick + ' command usage statistics';
			
			for (let row of userData) {
				output += '\n' + String.appendSpaces(row.COMMAND, 20) + formatNumberFunc(row.CALLED_TIMES);
			}
			
			msg.channel.stopTyping();
			msg.reply(output + '\n```');
		};
		
		if (!hideGlobal) {
			Postgres.query(command_stats_query, function(err1, data) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				Postgres.query(query, function(err2, userData) {
					if (err2) {
						console.log(err2);
						msg.reply('<internal pony error>');
						msg.channel.stopTyping();
						return;
					}
					
					callback(userData, data);
				});
			});
		} else {
			Postgres.query(query, function(err2, userData) {
				if (err2) {
					console.log(err2);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}

				callback(userData);
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'servercommandstats',
	alias: ['servercommstats', 'servercommandsstats', 'scstats'],
	
	help_args: '[user]',
	desc: 'Server command usage statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;n;';
		
		let id = DBot.GetUserID(msg.author);
		let serverid = DBot.GetServerID(msg.channel.guild);
		let nick = msg.author.username;
		let hideGlobal = false;
		
		if (typeof args[0] === 'object') {
			id = DBot.GetUserID(args[0]);
			nick = args[0].username;
			hideGlobal = true;
		}
		
		msg.channel.startTyping();
		
		const commands_query = `
			SELECT
				"COMMAND",
				SUM("COUNT") AS "CALLED_TIMES"
			FROM
				stats__command_servers
			WHERE
				"COMMAND" != 'more' AND
				"COMMAND" != 'retry' AND
				"ID" = ${serverid}
			GROUP BY
				"COMMAND"
			ORDER BY "CALLED_TIMES" DESC LIMIT 10
			`;
		
		const query = `
			SELECT
				"COMMAND",
				SUM("COUNT") AS "CALLED_TIMES"
			FROM
				stats__ucommand_servers
			WHERE
				"COMMAND" != 'more' AND
				"COMMAND" != 'retry' AND
				"ID" = ${serverid} AND
				"USER" = ${id}
			GROUP BY
				"COMMAND"
			ORDER BY "CALLED_TIMES" DESC LIMIT 10
		`;
		
		const callback = function(userData, data) {
			let output = '```';
			
			if (!hideGlobal) {
				output += '\n------ Server command usage statistics';
				
				for (let row of data) {
					output += '\n' + String.appendSpaces(row.COMMAND, 20) + formatNumberFunc(row.CALLED_TIMES);
				}
			}
			
			output += '\n------ @' + nick + ' command usage statistics on this server';
			
			for (let row of userData) {
				output += '\n' + String.appendSpaces(row.COMMAND, 20) + formatNumberFunc(row.CALLED_TIMES);
			}
			
			msg.channel.stopTyping();
			msg.reply(output + '\n```');
		};
		
		if (!hideGlobal) {
			Postgres.query(commands_query, function(err1, data) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				Postgres.query(query, function(err2, userData) {
					if (err2) {
						console.log(err2);
						msg.reply('<internal pony error>');
						msg.channel.stopTyping();
						return;
					}
					
					callback(userData, data);
				});
			});
		} else {
			Postgres.query(query, function(err2, userData) {
				if (err2) {
					console.log(err2);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}

				callback(userData);
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'channelcommandstats',
	alias: ['channelcommstats', 'channelcommandsstats', 'ccstats'],
	
	help_args: '[user]',
	desc: 'Channel command usage statistics',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;n;';
		
		let id = DBot.GetUserID(msg.author);
		let channelid = DBot.GetChannelID(msg.channel);
		let nick = msg.author.username;
		let hideGlobal = false;
		
		if (typeof args[0] === 'object') {
			id = DBot.GetUserID(args[0]);
			nick = args[0].username;
			hideGlobal = true;
		}
		
		msg.channel.startTyping();
		
		const commands_query = `
			SELECT
				"COMMAND",
				SUM("COUNT") AS "CALLED_TIMES"
			FROM
				stats__command_channels
			WHERE
				"COMMAND" != 'more' AND
				"COMMAND" != 'retry' AND
				"ID" = ${channelid}
			GROUP BY
				"COMMAND"
			ORDER BY "CALLED_TIMES" DESC LIMIT 10
			`;
		
		const query = `
			SELECT
				"COMMAND",
				SUM("COUNT") AS "CALLED_TIMES"
			FROM
				stats__ucommand_channels
			WHERE
				"COMMAND" != 'more' AND
				"COMMAND" != 'retry' AND
				"ID" = ${channelid} AND
				"USER" = ${id}
			GROUP BY
				"COMMAND"
			ORDER BY "CALLED_TIMES" DESC LIMIT 10
		`;
		
		const callback = function(userData, data) {
			let output = '```';
			
			if (!hideGlobal) {
				output += '\n------ Channel command usage statistics';
				
				for (let row of data) {
					output += '\n' + String.appendSpaces(row.COMMAND, 20) + formatNumberFunc(row.CALLED_TIMES);
				}
			}
			
			output += '\n------ @' + nick + ' command usage statistics on this channel';
			
			for (let row of userData) {
				output += '\n' + String.appendSpaces(row.COMMAND, 20) + formatNumberFunc(row.CALLED_TIMES);
			}
			
			msg.channel.stopTyping();
			msg.reply(output + '\n```');
		};
		
		if (!hideGlobal) {
			Postgres.query(commands_query, function(err1, data) {
				if (err1) {
					console.log(err1);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}
				
				Postgres.query(query, function(err2, userData) {
					if (err2) {
						console.log(err2);
						msg.reply('<internal pony error>');
						msg.channel.stopTyping();
						return;
					}
					
					callback(userData, data);
				});
			});
		} else {
			Postgres.query(query, function(err2, userData) {
				if (err2) {
					console.log(err2);
					msg.reply('<internal pony error>');
					msg.channel.stopTyping();
					return;
				}

				callback(userData);
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'server',
	
	help_args: '',
	desc: 'Server info',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;n;';
		
		msg.channel.startTyping();
		
		const server = msg.channel.guild;
		const users = server.members.array().length;
		const channels = server.channels.array().length;
		
		Postgres.query(sprintf(never_talk_sql_count, DBot.bot.user.id, server.uid, server.uid), function(err, data) {
			const inactiveUsers = data[0].COUNT || 0;
			const inactivePercent = Math.floor(inactiveUsers / users * 100 + 0.5);
			
			let onlineUsers = 0;
			
			for (let member of server.members.array()) {
				try {
					if (member.user.presence.status !== 'offline')
						onlineUsers++;
				} catch(err) {
					
				}
			}
			
			const onlinePerc = Math.floor(onlineUsers / users * 100 + 0.5);
			const verLevel = server.verificationLevel === 0 && 'NONE' ||
					server.verificationLevel === 1 && 'LOW' ||
					server.verificationLevel === 2 && 'MEDIUM' ||
					server.verificationLevel === 3 && 'HIGH';
			
			let reply = '```';
			reply += '\nServer name:               ' + server.name;
			reply += '\nServer ID:                 <' + server.id + '>';
			reply += '\nServer ID in my DB:        ' + server.uid;
			reply += '\nServer owner:              @' + (server.owner.nickname || server.owner.user.username) + ' <@' + server.owner.id + '>';
			reply += '\nServer avatar:\n' + (server.iconURL || '<server has no avatar>');
			reply += '\nTotal users:               ~' + users + ' (accurate: ' + server.memberCount + ', ' + inactiveUsers + ' are inactive (' + inactivePercent + '%), ' + onlineUsers + ' are online (' + onlinePerc + '%))';
			reply += '\nTotal channels:            ' + channels;
			reply += '\nServer region:             ' + server.region;
			reply += '\nDefault channel:           #' + server.defaultChannel.name;
			reply += '\nVerification level:        ' + verLevel;
			
			msg.reply(reply + '\n```');
			msg.channel.stopTyping();
		});
	}
});

DBot.RegisterCommand({
	name: 'channel',
	
	help_args: '',
	desc: 'Channel info',
	delay: 5,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;n;';
		
		msg.channel.startTyping();
		
		const server = msg.channel.guild;
		const users = server.members.array().length;
		const channel = msg.channel;
		
		Postgres.query(sprintf(never_talk_channel_sql_count, DBot.bot.user.id, server.uid, server.uid), function(err, data) {
			const inactiveUsers = data[0].COUNT || 0;
			const inactivePercent = Math.floor(inactiveUsers / users * 100 + 0.5);
			
			let reply = '```';
			reply += '\nChannel name:              ' + channel.name;
			reply += '\nServer ID:                 <' + channel.id + '>';
			reply += '\nServer ID in my DB:        ' + channel.uid;
			reply += '\nTotal inactive users:      ~' + inactiveUsers + ' are inactive (' + inactivePercent + '%)';
			reply += '\nIs Default channel:        ' + (server.defaultChannel.id === channel.id);
			reply += '\nChannel position:          ' + channel.position;
			reply += '\nChannel topic:             ' + channel.topic;
			
			msg.reply(reply + '\n```');
			msg.channel.stopTyping();
		});
	}
});