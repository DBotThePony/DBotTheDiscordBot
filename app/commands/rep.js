
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;

const hDuration = DBot.js.hDuration;
const moment = DBot.js.moment;
const fs = DBot.js.fs;

DBot.__RepCooldowns = DBot.__RepCooldowns || {};

Util.mkdir(DBot.WebRoot + '/repinfo');

const fn = function(act) {
	return function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Nut allowed in PM ;n;';
		
		if (DBot.__RepCooldowns[msg.author.id] > CurTime())
			return 'Cooldown! Wait ' + hDuration(Math.floor(DBot.__RepCooldowns[msg.author.id] - CurTime()) * 1000);
		
		if (typeof args[0] !== 'object' || msg.channel.guild.member(args[0]) === null)
			return DBot.CommandError('Must be user', act + 'rep', args, 1);
		
		DBot.__RepCooldowns[msg.author.id] = CurTime() + 360;
		msg.channel.startTyping();
		
		let reason;
		
		for (let i = 1; i < args.length; i++) {
			if (!args[i]) break;
			if (reason)
				reason += ' ' + args[i];
			else
				reason = args[i];
		}
		
		reason = reason || '<no reason given>';
		
		Postgres.query(`SELECT * FROM rep_users WHERE "ID" = ${sql.User(msg.author)}`, (err, data) => {
			if (err) {
				msg.channel.stopTyping();
				msg.reply('<Internal pone error>');
				console.error(err);
				return;
			}
			
			let amount = 1;
			
			if (data[0] && data[0].REP > 10) {
				amount = Math.floor(data[0].REP / 10);
			}
			
			const membr = msg.channel.guild.member(args[0]);
			let histQ;
			
			if (act === '+')
				histQ = `INSERT INTO rep_history("REC", "GIV", "SERVER", "AMOUNT", "REASON") VALUES(${sql.User(args[0])},${sql.User(msg.author)},'${msg.channel.guild.uid}','${amount}','${reason}')`;
			else
				histQ = `INSERT INTO rep_history("REC", "GIV", "SERVER", "AMOUNT", "REASON") VALUES(${sql.User(args[0])},${sql.User(msg.author)},'${msg.channel.guild.uid}','-${amount}','${reason}')`;
			
			const userQ = `INSERT INTO rep_users VALUES(${sql.User(args[0])}, ${amount}) ON CONFLICT ("ID") DO UPDATE SET "REP" = rep_users."REP" ${act} ${amount} RETURNING "REP"`;
			const membQ = `INSERT INTO rep_members VALUES(${sql.Member(membr)}, ${amount}) ON CONFLICT ("ID") DO UPDATE SET "REP" = rep_members."REP" ${act} ${amount} RETURNING "REP"`;

			Postgres.query(userQ, (err, data) => {
				if (err) {
					msg.channel.stopTyping();
					msg.reply('<Internal pone error>');
					console.error(err);
					return;
				}
				
				Postgres.query(membQ, (err, data2) => {
					if (err) {
						console.error(err);
						msg.channel.stopTyping();
						msg.reply('<Internal pone error>');
						return;
					}

					Postgres.query(histQ, (err) => {
						if (err) {
							console.error(err);
							msg.channel.stopTyping();
							msg.reply('<Internal pone error>');
							return;
						}
						
						msg.channel.stopTyping();
						msg.reply(`You gave ${act}${amount} reputation to <@${args[0].id}> (now he got ${data[0].REP} global rep, ${data2[0].REP} server rep)`);
					});
				});
			});
		});
	};
};

DBot.RegisterCommand({
	name: '+rep',
	
	help_args: '<user> [reason]',
	desc: 'Gives +rep to a user',
	allowUserArgument: true,
	
	func: fn('+')
});

DBot.RegisterCommand({
	name: '-rep',
	
	help_args: '<user> [reason]',
	desc: 'Gives +rep to a user',
	allowUserArgument: true,
	
	func: fn('-')
});

DBot.RegisterCommand({
	name: 'rep',
	
	help_args: '[user]',
	desc: 'User reputation',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let target;
		let userName;
		const pm = DBot.IsPM(msg);
		
		if (pm)
			target = msg.author;
		else if (!pm && typeof args[0] === 'object')
			if (msg.channel.guild.member(args[0]))
				target = msg.channel.guild.member(args[0]);
			else
				target = msg.member;
		else if (!pm && typeof args[0] !== 'object')
			target = msg.member;
		
		msg.channel.startTyping();
		
		const sha = String.hash(CurTime() + 'repinfo_' + msg.author.id + target.id);
		const path = DBot.WebRoot + '/repinfo/' + sha + '.html';
		const pathU = DBot.URLRoot + '/repinfo/' + sha + '.html';
		
		if (pm) {
			userName = target.username;
			
			Postgres.query(`SELECT * FROM rep_users WHERE "ID" = ${sql.User(target)}`, (err, data) => {
				Postgres.query(`SELECT rep_history.*, users."NAME" as "username" FROM rep_history, members, users WHERE "REC" = ${sql.User(target)} AND members."ID" = "GIV" AND users."ID" = members."USER" ORDER BY "STAMP" DESC LIMIT 100`, (err, dataHist) => {
					let dataRender = [];

					for (const row of dataHist) {
						const col = Number(row.AMOUNT) > 0;
						dataRender.push({
							username: row.username,
							col: col,
							amount: row.AMOUNT,
							comm: row.REASON,
							date: Util.formatStamp(row.STAMP)
						});
					}

					msg.channel.stopTyping();
					const rep = data[0] && data[0].REP || 0;

					if (dataRender.length > 0) {
						fs.writeFile(path, DBot.pugRender('rephist.pug', {
							data: dataRender,
							date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
							username: userName,
							server: 'N/A',
							title: 'Reputation history'
						}), console.errHandler);

						msg.reply(`Your global reputation is **${rep}** points\nReputation history: ${pathU}`);
					} else {
						msg.reply(`Your global reputation is **${rep}** points`);
					}
				});
			});
		} else {
			userName = target.user.username;
			Postgres.query(`SELECT * FROM rep_users WHERE "ID" = ${sql.User(target.user)}`, (err, data) => {
				Postgres.query(`SELECT * FROM rep_members WHERE "ID" = ${sql.Member(target)}`, (err, data2) => {
					Postgres.query(`SELECT rep_history.*, users."NAME" as "username" FROM rep_history, members, users WHERE "REC" = ${sql.User(target.user)} AND members."ID" = "GIV" AND users."ID" = members."USER" ORDER BY "STAMP" DESC LIMIT 100`, (err, dataHist) => {
						let dataRender = [];
						
						for (const row of dataHist) {
							const col = Number(row.AMOUNT) > 0;
							dataRender.push({
								username: row.username,
								col: col,
								amount: row.AMOUNT,
								comm: row.REASON,
								date: Util.formatStamp(row.STAMP)
							});
						}
						
						msg.channel.stopTyping();
						const rep = data[0] && data[0].REP || 0;
						const rep2 = data2[0] && data2[0].REP || 0;
						
						if (dataRender.length > 0) {
							fs.writeFile(path, DBot.pugRender('rephist.pug', {
								data: dataRender,
								date: moment().format('dddd, MMMM Do YYYY, HH:mm:ss'),
								username: userName,
								server: 'N/A',
								title: 'Reputation history'
							}), console.errHandler);
							
							msg.reply(`**@${target.user.username}** global reputation is **${rep}** points, server reputation is **${rep2}**\nReputation history: ${pathU}`);
						} else {
							msg.reply(`**@${target.user.username}** global reputation is **${rep}** points, server reputation is **${rep2}**`);
						}
					});
				});
			});
		}
	}
});