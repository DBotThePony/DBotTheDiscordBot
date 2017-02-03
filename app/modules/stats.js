
/* global Util, Postgres, DBot, sql, hook */

const numeral = require('numeral');
const moment = require('moment');
const hDuration = require('humanize-duration');

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

hook.Add('ChatStart', 'Statistics', function(channel, user) {
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
		Postgres.query('SELECT stats_hit(' + Util.escape(msg.author.id) + ', ' + length + ', ' + sql.Array(rWords) + '::VARCHAR(64)[], ' + Images + ')', function(err) {
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
		Postgres.query('SELECT stats_edit(' + Util.escape(msg.author.id) + ');');
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
		Postgres.query('SELECT stats_delete(' + Util.escape(msg.author.id) + ', ' + length + ');');
	}
});

hook.Add('CommandExecuted', 'Statistics', function(commandID, user, args, cmd, msg) {
	let channelID;
	let serverID;
	let userID = DBot.GetUserID(user);
	let extra = msg.channel.guild !== undefined && msg.channel.type !== 'dm';
	
	if (extra) {
		Postgres.query('SELECT stats_command(' + sql.Concat(msg.author.id, msg.channel.id, msg.channel.guild.id) + ', ' + Util.escape(commandID) + ');');
	} else {
		Postgres.query('SELECT stats_command(' + Util.escape(msg.author.id) + ', ' + Util.escape(commandID) + ');');
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
		
		for (let server of DBot.GetServers()) {
			validIDs.push(server.uid);
		}
		
		Postgres.query(serversQuery, function(err, data) {
			msg.channel.stopTyping();
			
			if (err) {
				msg.reply('<internal pony error>');
				return;
			}
			
			let output = '```\n' + Util.AppendSpaces('Server name', 60) + Util.AppendSpaces('Total phrases', 15) + Util.AppendSpaces('Chars printed', 15) + Util.AppendSpaces('Total commands executed', 10) + '\n';
			
			for (let row of data) {
				output += Util.AppendSpaces('<' + row.UID.trim() + '> ' + row.NAME, 60) + Util.AppendSpaces(numeral(row.TOTAL_PHRASES).format('0,0'), 15) + Util.AppendSpaces(numeral(row.TOTAL_CHARS).format('0,0'), 15) + Util.AppendSpaces(numeral(row.TOTAL_COMMANDS).format('0,0'), 10) + '\n';
			}
			
			msg.reply(output + '```');
		});
	}
});

let top10fn = function(name, order) {
	return function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is PM x3';
		
		let page = Util.ToNumber(args[0]) || 1;
		
		if (page <= 0)
			return DBot.CommandError('what', name, args, 1);
		
		let offset = (page - 1) * 20;
		
		msg.channel.startTyping();
		
		let ID = DBot.GetServerID(msg.channel.guild);
		
		let query = `
			SELECT
				users."UID" as "USERID",
				users."ID" as "ID",
				members."NAME" as "USERNAME",
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
				stats__uwords_servers."USER" = users."ID"
			GROUP BY
				users."UID",
				users."ID",
				members."NAME",
				stats__peruser_servers."MESSAGES"
			ORDER BY "${order}" DESC
			OFFSET ${offset} LIMIT 20`;
		
		Postgres.query(query, function(err, data) {
			if (err) {
				console.error(err);
				msg.reply('<internal pony error>');
				msg.channel.stopTyping();
				return;
			}
			
			try {
				if (!data[0]) {
					msg.channel.stopTyping();
					msg.reply('No data was returned in query');
					return;
				}
				
				msg.channel.stopTyping();
				
				let output = '\nRank. Username. Total Phrases Said.\n```';
				
				let i = 0;
				for (let row of data) {
					output += Util.AppendSpaces(Number(i) + 1 + (page - 1) * 20, 4)
						+ Util.AppendSpaces(row.USERNAME, 20) + ' --- '
						+ Util.AppendSpaces(numeral(row.COUNT).format('0,0')
						+ ' phrases', 15) + ' (' + numeral(row.TOTAL_WORDS).format('0,0')
						+ ' total words said; ' + numeral(row.TOTAL_UNIQUE_WORDS).format('0,0')
						+ ' unique words)\n';
					
					i++;
				}
				
				msg.reply(output + '```');
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
	
	func: top10fn('top10', 'COUNT')
});

DBot.RegisterCommand({
	name: 'wtop10',
	alias: ['wtop', 'wtop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this server\nUses "Total Words said" as ranking',
	delay: 5,
	
	func: top10fn('wtop10', 'TOTAL_WORDS')
});

DBot.RegisterCommand({
	name: 'utop10',
	alias: ['utop', 'utop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this server\nUses "Total Unique Words said" as ranking',
	delay: 5,
	
	func: top10fn('utop10', 'TOTAL_UNIQUE_WORDS')
});

let gtop10fn = function(name, order) {
	return function(args, cmd, msg) {
		let page = Util.ToNumber(args[0]) || 1;
		
		if (page <= 0)
			return DBot.CommandError('what', name, args, 1);
		
		let offset = (page - 1) * 20;
		
		msg.channel.startTyping();
		
		let query = `
			SELECT
				users."UID" as "USERID",
				users."ID" as "ID",
				users."NAME" as "USERNAME",
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
			OFFSET ${offset} LIMIT 20`;
		
		Postgres.query(query, function(err, data) {
			if (err) {
				console.error(err);
				msg.reply('<internal pony error>');
				msg.channel.stopTyping();
				return;
			}
			
			try {
				if (!data[0]) {
					msg.channel.stopTyping();
					msg.reply('No data was returned in query');
					return;
				}
				
				msg.channel.stopTyping();
				
				let output = '\nRank. Username. Total Phrases Said.\n```';
				
				let i = 0;
				for (let row of data) {
					output += Util.AppendSpaces(Number(i) + 1 + (page - 1) * 20, 4)
						+ Util.AppendSpaces(row.USERNAME, 20) + ' --- '
						+ Util.AppendSpaces(numeral(row.COUNT).format('0,0')
						+ ' phrases', 15) + ' (' + numeral(row.TOTAL_WORDS).format('0,0')
						+ ' total words said; ' + numeral(row.TOTAL_UNIQUE_WORDS).format('0,0')
						+ ' unique words)\n';
					
					i++;
				}
				
				msg.reply(output + '```');
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

let ctop10fn = function(name, order) {
	return function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is PM x3';
		
		let page = Util.ToNumber(args[0]) || 1;
		
		if (page <= 0)
			return DBot.CommandError('what', 'ctop10', args, 1);
		
		let offset = (page - 1) * 20;
		
		let ID = DBot.GetChannelID(msg.channel);
		
		let query = `
			SELECT
				users."UID" as "USERID",
				users."ID" as "ID",
				members."NAME" as "USERNAME",
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
			ORDER BY "COUNT" DESC
			OFFSET ${offset} LIMIT 20`;
		
		msg.channel.startTyping();
		
		Postgres.query(query, function(err, data) {
			if (err) {
				console.error(err);
				msg.reply('<internal pony error>');
				msg.channel.stopTyping();
				return;
			}
			
			try {
				if (!data[0]) {
					msg.channel.stopTyping();
					msg.reply('No data was returned in query');
					return;
				}
				
				msg.channel.stopTyping();
				
				let output = '\nRank. Username. Total Phrases Said.\n```';
				
				let i = 0;
				for (let row of data) {
					output += Util.AppendSpaces(Number(i) + 1 + (page - 1) * 20, 4)
						+ Util.AppendSpaces(row.USERNAME, 20) + ' --- '
						+ Util.AppendSpaces(numeral(row.COUNT).format('0,0')
						+ ' phrases', 15) + ' (' + numeral(row.TOTAL_WORDS).format('0,0')
						+ ' total words said; ' + numeral(row.TOTAL_UNIQUE_WORDS).format('0,0')
						+ ' unique words)\n';
					
					i++;
				}
				
				msg.reply(output + '```');
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
	
	func: ctop10fn('ctop10', 'COUNT')
});

DBot.RegisterCommand({
	name: 'wctop10',
	alias: ['wctop', 'wctop20', 'cwtop', 'cwtop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this channel\nUses "Total words said" as ranking',
	delay: 5,
	
	func: ctop10fn('wctop10', 'TOTAL_WORDS')
});

DBot.RegisterCommand({
	name: 'uctop10',
	alias: ['uctop', 'uctop20', 'cutop', 'cutop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this channel\nUses "Total unique words said" as ranking',
	delay: 5,
	
	func: ctop10fn('uctop10', 'TOTAL_UNIQUE_WORDS')
});


Util.mkdir(DBot.WebRoot + '/ntstats');
const fs = DBot.js.fs;

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
				
				let sha = DBot.HashString(CurTime() + '_' + msg.channel.guild.uid);
				let stream = fs.createWriteStream(DBot.WebRoot + '/ntstats/' + sha + '.txt');
				
				stream.write('Table of users\n');
				
				for (let row of data) {
					stream.write('\t <@' + row.USERID + '> ' + Util.AppendSpaces(row.MEMBERNAME, 60) + '(' + row.USERNAME + ')\n');
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
				members."ID" = stats__server_get."MEMBER"
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
				
				let output = '```' + Util.AppendSpaces('Username', 30) + Util.AppendSpaces('Get', 10) + Util.AppendSpaces('Date', 10) + '\n';
				
				for (let row of data) {
					output += Util.AppendSpaces(row.NAME, 30) + Util.AppendSpaces(numeral(row.NUMBER * 1000).format('0,0'), 10) + Util.AppendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ')', 10) + '\n';
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
				members."ID" = stats__server_get_image."MEMBER"
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
				
				let output = '```' + Util.AppendSpaces('Username', 30) + Util.AppendSpaces('Get', 10) + Util.AppendSpaces('Date', 10) + '\n';
				
				for (let row of data) {
					output += Util.AppendSpaces(row.NAME, 30) + Util.AppendSpaces(numeral(row.NUMBER * 100).format('0,0'), 10) + Util.AppendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 100) + ')', 10) + '\n';
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
				members."ID" = stats__channel_get."MEMBER"
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
				
				let output = '```' + Util.AppendSpaces('Username', 30) + Util.AppendSpaces('Get', 10) + Util.AppendSpaces('Date', 10) + '\n';
				
				for (let row of data) {
					output += Util.AppendSpaces(row.NAME, 30) + Util.AppendSpaces(numeral(row.NUMBER * 1000).format('0,0'), 10) + Util.AppendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ')', 10) + '\n';
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
				members."ID" = stats__channel_get_image."MEMBER"
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
				
				let output = '```' + Util.AppendSpaces('Username', 30) + Util.AppendSpaces('Get', 10) + Util.AppendSpaces('Date', 10) + '\n';
				
				for (let row of data) {
					output += Util.AppendSpaces(row.NAME, 30) + Util.AppendSpaces(numeral(row.NUMBER * num * 100).format('0,0'), 10) + Util.AppendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * num * 100) + ')', 10) + '\n';
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
					
					let output = Util.AppendSpaces('Word', 25) + Util.AppendSpaces('Count', 6) + '\n```\n';
					
					output += '----- Server\n';
					
					for (let row of gdata) {
						output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					output += '----- Your\n';
					
					for (let row of udata) {
						output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
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
				
				let output = Util.AppendSpaces('Word', 25) + Util.AppendSpaces('Count', 6) + '\n```\n';
				
				output += '----- His\n';
				
				for (let row of udata) {
					output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
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
					
					let output = Util.AppendSpaces('Word', 25) + Util.AppendSpaces('Count', 6) + '\n```\n';
					
					output += '----- Channel\n';
					
					for (let row of gdata) {
						output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					output += '----- Your\n';
					
					for (let row of udata) {
						output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
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
				
				let output = Util.AppendSpaces('Word', 25) + Util.AppendSpaces('Count', 6) + '\n```\n';
				
				output += '----- His\n';
				
				for (let row of udata) {
					output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
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
					
					let output = Util.AppendSpaces('Word', 25) + Util.AppendSpaces('Count', 6) + '\n```\n';
					
					output += '----- Global\n';
					
					for (let row of gdata) {
						output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
					}
					
					output += '----- Your\n';
					
					for (let row of udata) {
						output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
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
				
				let output = Util.AppendSpaces('Word', 25) + Util.AppendSpaces('Count', 6) + '\n```\n';
				
				output += '----- His\n';
				
				for (let row of udata) {
					output += Util.AppendSpaces(row.WORD.substr(0, 20), 25) + Util.AppendSpaces(numeral(row.SUM).format('0,0'), 6) + '\n';
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
		stats__command_users
	GROUP BY
		"COMMAND"
	ORDER BY
		"COUNT" DESC
	LIMIT 1
)

SELECT
	SUM("CHARS") AS "TotalChars",
	SUM("MESSAGES") AS "TotalMessages",
	SUM("MESSAGES_E") AS "TotalMessagesEdited",
	SUM("MESSAGES_D") AS "TotalMessagesDeleted",
	SUM("IMAGES") AS "TotalImagesSent",
	SUM("TYPINGS") AS "TotalTypings",
	(SELECT "COMMAND" FROM most_used_command) AS "MostCommandUsed",
	(SELECT "COUNT" FROM most_used_command) AS "MostCommandUsedCount"
FROM
	stats__generic_users
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
			nick = args[0].username
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
			)

			SELECT
				"CHARS" AS "TotalChars",
				"MESSAGES" AS "TotalMessages",
				"MESSAGES_E" AS "TotalMessagesEdited",
				"MESSAGES_D" AS "TotalMessagesDeleted",
				"IMAGES" AS "TotalImagesSent",
				"TYPINGS" AS "TotalTypings",
				(SELECT "COMMAND" FROM most_used_command) AS "MostCommandUsed",
				(SELECT "COUNT" FROM most_used_command) AS "MostCommandUsedCount"
			FROM
				stats__generic_users
			WHERE
				"ID" = ${id}
			`;
		
		const funcCallback = function(userData, data) {
			let output = '```';
			
			if (!hideGlobal) {
				const servers = DBot.GetServers().length;
				const channels = DBot.GetChannels().length;
				const members = DBot.GetMembers().length;
				const users = DBot.GetUsers().length;
				
				output += '\nTotal servers:                   ' + formatNumberFunc(DBot.GetServers().length);
				output += '\nTotal channels:                  ' + formatNumberFunc(DBot.GetChannels().length);
				output += '\nTotal users:                     ' + formatNumberFunc(DBot.GetMembers().length);
				output += '\nTotal unique users:              ' + formatNumberFunc(DBot.GetUsers().length);
				output += '\n------ Global statistics';
				output += '\nTotal chars printed:             ' + formatNumberFunc(data[0].TotalChars);
				output += '\nTotal messages sent:             ' + formatNumberFunc(data[0].TotalMessages);
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

/*
DBot.RegisterCommand({
	name: 'stats',
	
	help_args: '[user]',
	desc: 'Displays generic statistics collected by me\nIf user is specified, prints this user global statistics',
	delay: 10,
	
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		msg.channel.startTyping();
		
		let servers = 0;
		let channels = 0;
		let users = 0;
		let USERS_MEM = {};
		let ID = DBot.GetUserID(msg.author);
		
		let Servers = DBot.GetServers();
		
		for (let i in Servers) {
			servers++;
			let Channels = Servers[i].channels.array();
			let Users = Servers[i].members.array();
			
			channels = Channels.length;
			
			for (let us in Users) {
				let user = Users[us].user;
				let uid = user.id;
				
				if (!USERS_MEM[uid]) {
					users++;
					USERS_MEM[uid] = true;
				}
			}
		}
		
		let UserID = msg.author.id;
		
		if (typeof args[0] == 'object')
			UserID = args[0].id;
		
		let userQuery = '';
	},
});
*/

/*
DBot.RegisterCommand({
	name: 'sstats',
	alias: ['server', 'serverstats'],
	
	help_args: '[user]',
	desc: 'Displays this server statistics collected by me\nIf user is specified, displays his statistics on this server',
	delay: 10,
	
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is a PM! x3';
		
		let server = msg.channel.guild;
		let ID = DBot.GetServerID(server);
		
		msg.channel.startTyping();
		
		if (typeof args[0] != 'object') {
			let UID = DBot.GetUserID(msg.author);
			
			let Channels = server.channels.array();
			let Users = server.members.array();
			let channels = Channels.length;
			let users = Users.length;
			let onlineUsers = 0;
			
			for (let member of Users) {
				try {
					let status = member.user.presence.status;
					
					if (status != 'offline')
						onlineUsers++;
				} catch(err) {
					
				}
			}
			
			let percentOnline = Math.floor(onlineUsers / users * 100);
			
			let q = 'SELECT SUM("COUNT") as "cnt" FROM stats__chars_server WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__words_server WHERE "UID" = ' + ID + ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__words_server WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__images_server WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_server WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_server WHERE "UID" = ' + ID + ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_server WHERE "UID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_server_d WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_server_e WHERE "UID" = ' + ID + ';\
			';
			
			let qU = 'SELECT SUM("COUNT") as "cnt" FROM stats__uchars_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uwords_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__uwords_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uimages_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_userver WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT stats_get_rank(' + UID + ', ' + ID + ') AS "RANK";\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_server_d WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_server_e WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_userver WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			';
			
			// Generic Server Stats
			Postgres.query(q, function(err, data) {
				
				// Server Stats by user
				Postgres.query(qU, function(err, uData) {
					
					// Users that are inactive
					Postgres.query(sprintf(never_talk_sql, DBot.bot.user.id, msg.channel.guild.uid, msg.channel.guild.uid), function(err, iData) {
						msg.channel.stopTyping();
						
						try {
							for (let i = 0; i <= 8; i++) {
								uData[i] = uData[i] || [];
								data[i] = data[i] || [];
								uData[i][0] = uData[i][0] || {};
								data[i][0] = data[i][0] || {};
							}
							
							let inactiveCount = 0;
							
							for (let i of iData) {
								inactiveCount++;
							}
							
							let percentInactive = Math.floor(inactiveCount / users * 100);
							
							let TotalChars = data[0].cnt || 0;
							let TotalWordsSaid = data[1].cnt || 0;
							let TotalUniqueWords = data[2].cnt || 0;
							let TotalImagesSend = data[3].cnt || 0;
							let TotalPhrasesSaid = data[4].cnt || 0;
							let TotalCommandsExecuted = data[5].cnt || 0;
							
							let MostUsedCommand = data[6].COMMAND || '<unknown>';
							let MostUsedCommand_count = data[6].summ || 0;
							let TotalPhrasesDeleted = data[7].cnt || 0;
							let TotalPhrasesEdited = data[8].cnt || 0;
							
							let TotalChars_USER = uData[0].cnt || 0;
							let TotalWordsSaid_USER = uData[1].cnt || 0;
							let TotalUniqueWords_USER = uData[2].cnt || 0;
							let TotalImagesSend_USER = uData[3].cnt || 0;
							let TotalPhrasesSaid_USER = uData[4].cnt || 0;
							let TotalCommandsExecuted_USER = uData[5].cnt || 0;
							
							let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
							let TotalPhrasesEdited_USER = uData[8].cnt || 0;
							let RANK = uData[6].RANK || 0;
							let MostUsedCommand_USER = uData[9].COMMAND || '<unknown>';
							let MostUsedCommand_count_USER = uData[9].summ || 0;
							
							let output = '\n```';
							
							output += '------ Infos\n';
							output += 'Server Name:                              ' + msg.channel.guild.name + '\n';
							output += 'Server ID:                                ' + msg.channel.guild.id + '\n';
							output += 'Server Owner:                             @' + msg.channel.guild.owner.user.username + '\n';
							output += 'Server ID in my Database:                 ' + ID + '\n';
							output += 'Server region:                            ' + msg.channel.guild.region + '\n';
							output += 'Server default channel:                   #' + msg.channel.guild.defaultChannel.name + '\n';
							output += 'Server avatar URL:\n' + (msg.channel.guild.iconURL || '<no avatar>') + '\n';
							output += 'Server is large?:                         ' + (msg.channel.guild.large && 'yes' || 'no') + '\n';
							output += '------ Statistics\n';
							
							output += 'Total Channels on this server:            ' + numeral(channels).format('0,0') + '\n';
							output += 'Total Users on this server:              ' + (msg.channel.guild.large && '~' || ' ') + numeral(users).format('0,0') + ' (' + numeral(onlineUsers).format('0,0') + ' online, ' + percentOnline + '%, ' + numeral(inactiveCount).format('0,0') + ' inactive, ' + percentInactive + '%)\n';
							output += 'Total chars printed by all users:         ' + numeral(TotalChars).format('0,0') + '\n';
							output += 'Total words said by all users:            ' + numeral(TotalWordsSaid).format('0,0') + '\n';
							output += 'Total unique words:                       ' + numeral(TotalUniqueWords).format('0,0') + '\n';
							output += 'Total images sent:                        ' + numeral(TotalImagesSend).format('0,0') + '\n';
							output += 'Total phrases said by all users:          ' + numeral(TotalPhrasesSaid).format('0,0') + '\n';
							output += 'Total phrases edited:                     ' + numeral(TotalPhrasesEdited).format('0,0') + '\n';
							output += 'Total phrases deleted:                    ' + numeral(TotalPhrasesDeleted).format('0,0') + '\n';
							output += 'Total amount of commands executed:        ' + numeral(TotalCommandsExecuted).format('0,0') + '\n';
							output += 'Most command used:                        ' + MostUsedCommand + '; Times Executed: ' + numeral(MostUsedCommand_count).format('0,0') + '\n';
							
							output += '------ Your stats on this server\n';
							
							output += 'Rank:                                     ' + numeral(RANK).format('0,0') + '\n';
							output += 'Total chars printed:                      ' + numeral(TotalChars_USER).format('0,0') + '\n';
							output += 'Total words said:                         ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
							output += 'Total unique words said:                  ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
							output += 'Total images sent:                        ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
							output += 'Total phrases said:                       ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
							output += 'Total amount of commands executed:        ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
							output += 'Most command used:                        ' + MostUsedCommand_USER + '; Times Executed: ' + MostUsedCommand_count_USER + '\n';
							
							output += '```\nAlso try stats (global statistics) and cstats (channel statistics)';
							
							msg.reply(output);
						} catch(err) {
							console.error(err);
							msg.reply('<internal pony error>');
						}
					});
				});
			});
		} else {
			let UID = DBot.GetUserID(args[0]);
			
			let qU = 'SELECT SUM("COUNT") as "cnt" FROM stats__uchars_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uwords_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__uwords_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uimages_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_server WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_userver WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ';\
			SELECT stats_get_rank(' + UID + ', ' + ID + ') AS "RANK";\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_server_d WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_server_e WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_userver WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			';
			
			// Server Stats by user
			Postgres.query(qU, function(err, uData) {
				msg.channel.stopTyping();
				
				try {
					for (let i = 0; i <= 9; i++) {
						uData[i] = uData[i] || [];
						uData[i][0] = uData[i][0] || {};
					}
					
					let TotalChars_USER = uData[0].cnt || 0;
					let TotalWordsSaid_USER = uData[1].cnt || 0;
					let TotalUniqueWords_USER = uData[2].cnt || 0;
					let TotalImagesSend_USER = uData[3].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5].cnt || 0;
					
					let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
					let TotalPhrasesEdited_USER = uData[8].cnt || 0;
					let RANK = uData[6].RANK || 0;
					let MostUsedCommand_USER = uData[9].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[9].summ || 0;
					
					let output = '\n```';
					
					output += '------ @' + args[0].username + ' stats on this server\n';
					
					output += 'Rank:                                         ' + numeral(RANK).format('0,0') + '\n';
					output += 'Total chars printed:                          ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                             ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                      ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sent:                            ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
					output += 'Total phrases said:                           ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
					output += 'Total phrases edited:                         ' + numeral(TotalPhrasesEdited_USER).format('0,0') + '\n';
					output += 'Total phrases deleted:                        ' + numeral(TotalPhrasesDeleted_USER).format('0,0') + '\n';
					output += 'Total amount of commands executed:            ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
					output += 'Most command used:                            ' + MostUsedCommand_USER + '; Times Executed: ' + MostUsedCommand_count_USER + '\n';
					
					output += '```';
					
					msg.reply(output);
				} catch(err) {
					console.error(err);
					msg.reply('<internal pony error>');
				}
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'cstats',
	alias: ['channel', 'channelstats'],
	
	help_args: '[user]',
	desc: 'Displays this channel statistics collected by me\nIf user is specified, displays his statistics on this channel',
	delay: 10,
	
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is a PM! x3';
		
		let channel = msg.channel;
		let ID = DBot.GetChannelID(channel);
		
		msg.channel.startTyping();
		
		if (typeof args[0] != 'object') {
			let UID = DBot.GetUserID(msg.author);
			
			// Generic Server Stats
			let q = 'SELECT SUM("COUNT") as "cnt" FROM stats__chars_channel WHERE "UID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__words_channel WHERE "UID" = ' + ID +  ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__words_channel WHERE "UID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__images_channel WHERE "UID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_channel WHERE "UID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_channel WHERE "UID" = ' + ID +  ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_channel WHERE "UID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1' +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_channel_d WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_channel_e WHERE "UID" = ' + ID + ';\
			';
			
			// Channel Stats by user
			let qU = 'SELECT SUM("COUNT") as "cnt" FROM stats__uchars_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uwords_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__uwords_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uimages_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_uchannel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT stats_get_rank_channel(' + UID + ', ' + ID + ') AS "RANK";\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_channel_d WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_channel_e WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_uchannel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1' +  ';\
			';
			
			Postgres.query(q, function(err, data) {
				Postgres.query(qU, function(err, uData) {
					msg.channel.stopTyping();
					
					try {
						for (let i = 0; i <= 9; i++) {
							uData[i] = uData[i] || [];
							data[i] = data[i] || [];
							uData[i][0] = uData[i][0] || {};
							data[i][0] = data[i][0] || {};
						}
						
						let TotalChars = data[0].cnt || 0;
						let TotalWordsSaid = data[1].cnt || 0;
						let TotalUniqueWords = data[2].cnt || 0;
						let TotalImagesSend = data[3].cnt || 0;
						let TotalPhrasesSaid = data[4].cnt || 0;
						let TotalCommandsExecuted = data[5].cnt || 0;
						
						let MostUsedCommand = data[6].COMMAND || '<unknown>';
						let MostUsedCommand_count = data[6].summ || 0;
						let TotalPhrasesDeleted = data[7].cnt || 0;
						let TotalPhrasesEdited = data[8].cnt || 0;
						
						let TotalChars_USER = uData[0].cnt || 0;
						let TotalWordsSaid_USER = uData[1].cnt || 0;
						let TotalUniqueWords_USER = uData[2].cnt || 0;
						let TotalImagesSend_USER = uData[3].cnt || 0;
						let TotalPhrasesSaid_USER = uData[4].cnt || 0;
						let TotalCommandsExecuted_USER = uData[5].cnt || 0;
						
						let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
						let TotalPhrasesEdited_USER = uData[8].cnt || 0;
						let RANK = uData[6].RANK || 0;
						let MostUsedCommand_USER = uData[9].COMMAND || '<unknown>';
						let MostUsedCommand_count_USER = uData[9].summ || 0;
						
						let output = '\n```';
						
						output += '------ Infos\n';
						output += 'Channel Name:                            ' + msg.channel.name + '\n';
						output += 'Channel ID:                              ' + msg.channel.id + '\n';
						output += 'Channel ID in my Database:               ' + ID + '\n';
						output += 'Is default channel?:                     ' + (msg.channel.guild.defaultChannel.id == msg.channel.id && 'yes' || 'no') + '\n';
						output += '------ Statistics\n';
						
						output += 'Total chars printed by all users:        ' + numeral(TotalChars).format('0,0') + '\n';
						output += 'Total words said by all users:           ' + numeral(TotalWordsSaid).format('0,0') + '\n';
						output += 'Total unique words:                      ' + numeral(TotalUniqueWords).format('0,0') + '\n';
						output += 'Total images sent:                       ' + numeral(TotalImagesSend).format('0,0') + '\n';
						output += 'Total phrases said by all users:         ' + numeral(TotalPhrasesSaid).format('0,0') + '\n';
						output += 'Total phrases edited:                    ' + numeral(TotalPhrasesEdited).format('0,0') + '\n';
						output += 'Total phrases deleted:                   ' + numeral(TotalPhrasesDeleted).format('0,0') + '\n';
						output += 'Total amount of commands executed:       ' + numeral(TotalCommandsExecuted).format('0,0') + '\n';
						output += 'Most command used:                       ' + MostUsedCommand + '; Times Executed: ' + numeral(MostUsedCommand_count).format('0,0') + '\n';
						
						output += '------ Your stats on this channel\n';
						
						output += 'Rank:                                    ' + numeral(RANK).format('0,0') + '\n';
						output += 'Total chars printed:                     ' + numeral(TotalChars_USER).format('0,0') + '\n';
						output += 'Total words said:                        ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
						output += 'Total unique words said:                 ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
						output += 'Total images sent:                       ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
						output += 'Total phrases said:                      ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
						output += 'Total phrases edited:                    ' + numeral(TotalPhrasesEdited_USER).format('0,0') + '\n';
						output += 'Total phrases deleted:                   ' + numeral(TotalPhrasesDeleted_USER).format('0,0') + '\n';
						output += 'Total amount of commands executed:       ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
						output += 'Most command used:                       ' + MostUsedCommand_USER + '; Times Executed: ' + numeral(MostUsedCommand_count_USER).format('0,0') + '\n';
						
						output += '```\nAlso try stats (global statistics) and sstats (server statistics)';
						
						msg.reply(output);
					} catch(err) {
						console.error(err);
						msg.reply('<internal pony error>');
					}
				});
			});
		} else {
			let UID = DBot.GetUserID(args[0]);
			
			// Channel Stats by user
			let q = 'SELECT SUM("COUNT") as "cnt" FROM stats__uchars_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uwords_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__uwords_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uimages_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_channel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_uchannel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT stats_get_rank_channel(' + UID + ', ' + ID + ') AS "RANK";\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_channel_d WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uphrases_channel_e WHERE "UID" = ' + UID + ' AND "ID" = ' + ID +  ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_uchannel WHERE "UID" = ' + UID + ' AND "ID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1' +  ';\
			';
			
			Postgres.qeury(q, function(err, uData) {
				msg.channel.stopTyping();
				
				try {
					for (let i = 0; i <= 9; i++) {
						uData[i] = uData[i] || [];
						uData[i][0] = uData[i][0] || {};
					}
					
					let TotalChars_USER = uData[0].cnt || 0;
					let TotalWordsSaid_USER = uData[1].cnt || 0;
					let TotalUniqueWords_USER = uData[2].cnt || 0;
					let TotalImagesSend_USER = uData[3].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5].cnt || 0;
					
					let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
					let TotalPhrasesEdited_USER = uData[8].cnt || 0;
					let RANK = uData[6].RANK || 0;
					let MostUsedCommand_USER = uData[9].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[9].summ || 0;
					
					let output = '\n```';
					
					output += '------ @' + args[0].username + ' stats on this channel\n';
					
					output += 'Rank:                                       ' + numeral(RANK).format('0,0') + '\n';
					output += 'Total chars printed:                        ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                           ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                    ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sent:                          ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
					output += 'Total phrases said:                         ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
					output += 'Total phrases edited:                       ' + numeral(TotalPhrasesEdited_USER).format('0,0') + '\n';
					output += 'Total phrases deleted:                      ' + numeral(TotalPhrasesDeleted_USER).format('0,0') + '\n';
					output += 'Total amount of commands executed:          ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
					output += 'Most command used:                          ' + MostUsedCommand_USER + '; Times Executed: ' + numeral(MostUsedCommand_count_USER).format('0,0') + '\n';
					
					output += '```';
					
					msg.reply(output);
				} catch(err) {
					console.error(err);
					msg.reply('<internal pony error>');
				}
			});
		}
	}
});

let SPACES = function(len) {
	if (len <= 0)
		return '';
	
	let output = '';
	
	for (let i = 1; i <= len; i++) {
		output += ' ';
	}
	
	return output;
}

DBot.RegisterCommand({
	name: 'commandstats',
	alias: ['commstats'],
	
	help_args: '[user]',
	desc: 'Displays global command usage statistics\nIf user is specified, displays his command statistics',
	delay: 10,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		msg.channel.startTyping();
		
		if (typeof args[0] != 'object') {
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_user WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data) {
				Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_user WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(msg.author) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
					msg.channel.stopTyping();
					try {
						let output = 'Global command usage statistics\nCommand                   Used times\n```';
						
						for (let i in data) {
							let row = data[i];
							
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\nYour command usage statistics\nCommand                        Used times\n```';
						
						for (let i in data2) {
							let row = data2[i];
							
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\n';
						
						msg.reply(output);
					} catch(err) {
						console.error(err);
						msg.reply('<internal pony error>');
					}
				});
			});
		} else {
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_user WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(args[0]) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
				msg.channel.stopTyping();
				
				try {
					let output = '@' + args[0].username + ' command usage statistics\nCommand                        Used times\n```';
					
					for (let i in data2) {
						let row = data2[i];
						
						output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
					}
					
					output += '```\n';
					
					msg.reply(output);
				} catch(err) {
					console.error(err);
					msg.reply('<internal pony error>');
				}
			});
		}
	},
});

DBot.RegisterCommand({
	name: 'scommandstats',
	alias: ['scommstats'],
	
	help_args: '[user]',
	desc: 'Displays this server command usage statistics\nIf user is specified, displays his command statistics on this server',
	delay: 10,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		msg.channel.startTyping();
		
		if (typeof args[0] != 'object') {
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_server WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetServerID(msg.channel.guild) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data) {
				Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_userver WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(msg.author) + '\' AND "ID" = \'' + DBot.GetServerID(msg.channel.guild) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
					msg.channel.stopTyping();
					
					try {
						let output = 'This server command usage statistics\nCommand                    Used times\n```';
						
						for (let row of data) {
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\nYour command usage statistics on this server\nCommand                    Used times\n```';
						
						for (let row of data2) {
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\n';
						
						msg.reply(output);
					} catch(err) {
						console.error(err);
						msg.reply('<internal pony error>');
					}
				});
			});
		} else {
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_userver WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(args[0]) + '\' AND "ID" = \'' + DBot.GetServerID(msg.channel.guild) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
				msg.channel.stopTyping();
				
				try {
					let output = '@' + args[0].username + ' command usage statistics on this server\nCommand                    Used times\n```';
					
					for (let row of data2) {
						output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
					}
					
					output += '```\n';
					
					msg.reply(output);
				} catch(err) {
					console.error(err);
					msg.reply('<internal pony error>');
				}
			});
		}
	},
});

DBot.RegisterCommand({
	name: 'ccommandstats',
	alias: ['ccommstats'],
	
	help_args: '[user]',
	desc: 'Displays this channel command usage statistics\nIf user is specified, displays his command statistics on this channel',
	delay: 10,
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		msg.channel.startTyping();
		
		if (typeof args[0] != 'object') {
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_channel WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetChannelID(msg.channel) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data) {
				Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_uchannel WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(msg.author) + '\' AND "ID" = \'' + DBot.GetChannelID(msg.channel) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
					msg.channel.stopTyping();
					try {
						let output = 'This channel command usage statistics\nCommand                    Used times\n```';
						
						for (let row of data) {
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\nYour command usage statistics on this channel\nCommand                    Used times\n```';
						
						for (let row of data2) {
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\n';
						
						msg.reply(output);
					} catch(err) {
						console.error(err);
						msg.reply('<internal pony error>');
					}
				});
			});
		} else {
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_uchannel WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(args[0]) + '\' AND "ID" = \'' + DBot.GetChannelID(msg.channel) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
				msg.channel.stopTyping();
				try {
					let output =  '@' + args[0].username + ' command usage statistics on this channel\nCommand                    Used times\n```';
					
					for (let row of data2) {
						output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
					}
					
					output += '```\n';
					
					msg.reply(output);
				} catch(err) {
					console.error(err);
					msg.reply('<internal pony error>');
				}
			});
		}
	},
});

*/
