
const numeral = require('numeral');
const moment = require('moment');
const hDuration = require('humanize-duration');

hook.Add('OnHumanMessage', 'Statistics', function(msg) {
	let extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	let Words = msg.content.split(/( |\n)+/gi);
	let rWords = [];
	let length = msg.content.length;
	
	var Images;
	
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
	
	let extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
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
	
	let extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
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
	let extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	
	if (extra) {
		Postgres.query('SELECT stats_command(' + sql.Concat(msg.author.id, msg.channel.id, msg.channel.guild.id) + ', ' + Util.escape(commandID) + ');');
	} else {
		Postgres.query('SELECT stats_command(' + Util.escape(msg.author.id) + ', ' + Util.escape(commandID) + ');');
	}
});

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
			
			let q = 'SELECT "COUNT" as "cnt" FROM stats__chars_server WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__words_server WHERE "UID" = ' + ID + ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__words_server WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__images_server WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_server WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_server WHERE "UID" = ' + ID + ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_server WHERE "UID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			SELECT "COUNT" as "cnt" FROM stats__phrases_server_d WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_server_e WHERE "UID" = ' + ID + ';\
			';
			
			let qU = 'SELECT "COUNT" as "cnt" FROM stats__uchars_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uwords_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__uwords_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__uimages_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_userver WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_userver WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_server_d WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_server_e WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID +  ';\
			';
			
			// Generic Server Stats
			Postgres.query(q, function(err, data) {
				
				// Server Stats by user
				Postgres.query(qU, function(err, uData) {
					msg.channel.stopTyping();
					
					try {
						for (let i = 0; i <= 8; i++) {
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
						
						let MostUsedCommand_USER = uData[6].COMMAND || '<unknown>';
						let MostUsedCommand_count_USER = uData[6].summ || 0;
						let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
						let TotalPhrasesEdited_USER = uData[8].cnt || 0;
						
						let output = '\n```';
						
						output += '------ Infos\n';
						output += 'Server Name:                              ' + msg.channel.guild.name + '\n';
						output += 'Server ID:                                ' + msg.channel.guild.id + '\n';
						output += 'Server Owner:                             @' + msg.channel.guild.owner.user.username + '\n';
						output += 'Server ID in my Database:                 ' + ID + '\n';
						output += 'Server region:                            ' + msg.channel.guild.region + '\n';
						output += 'Server default channel:                   #' + msg.channel.guild.defaultChannel.name + '\n';
						output += 'Server avatar URL:                        ' + (msg.channel.guild.iconURL || '<no avatar>') + '\n';
						output += 'Server is large?:                         ' + (msg.channel.guild.large && 'yes' || 'no') + '\n';
						output += '------ Statistics\n';
						
						output += 'Total Channels on this server:            ' + numeral(channels).format('0,0') + '\n';
						output += 'Total Users on this server:               ' + numeral(users).format('0,0') + '\n';
						output += 'Total chars printed by all users:         ' + numeral(TotalChars).format('0,0') + '\n';
						output += 'Total words said by all users:            ' + numeral(TotalWordsSaid).format('0,0') + '\n';
						output += 'Total unique words:                       ' + numeral(TotalUniqueWords).format('0,0') + '\n';
						output += 'Total images sended:                      ' + numeral(TotalImagesSend).format('0,0') + '\n';
						output += 'Total phrases said by all users:          ' + numeral(TotalPhrasesSaid).format('0,0') + '\n';
						output += 'Total phrases edited:                     ' + numeral(TotalPhrasesEdited).format('0,0') + '\n';
						output += 'Total phrases deleted:                    ' + numeral(TotalPhrasesDeleted).format('0,0') + '\n';
						output += 'Total amount of commands executed:        ' + numeral(TotalCommandsExecuted).format('0,0') + '\n';
						output += 'Most command used:                        ' + MostUsedCommand + '; Times Executed: ' + numeral(MostUsedCommand_count).format('0,0') + '\n';
						
						output += '------ Your stats on this server\n';
						
						output += 'Total chars printed:                      ' + numeral(TotalChars_USER).format('0,0') + '\n';
						output += 'Total words said:                         ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
						output += 'Total unique words said:                  ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
						output += 'Total images sended:                      ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
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
		} else {
			let UID = DBot.GetUserID(msg.author);
			
			let qU = 'SELECT "COUNT" as "cnt" FROM stats__uchars_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uwords_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__uwords_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__uimages_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_server WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_userver WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_userver WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_server_d WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_server_e WHERE "UID" = ' + UID + ' AND "USERVER" = ' + ID +  ';\
			';
			
			// Server Stats by user
			Postgres.query(qU, function(err, uData) {
				msg.channel.stopTyping();
				
				try {
					for (let i = 0; i <= 8; i++) {
						uData[i] = uData[i] || [];
						uData[i][0] = uData[i][0] || {};
					}
					
					let TotalChars_USER = uData[0].cnt || 0;
					let TotalWordsSaid_USER = uData[1].cnt || 0;
					let TotalUniqueWords_USER = uData[2].cnt || 0;
					let TotalImagesSend_USER = uData[3].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5].cnt || 0;
					
					let MostUsedCommand_USER = uData[6].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[6].summ || 0;
					let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
					let TotalPhrasesEdited_USER = uData[8].cnt || 0;
					
					let output = '\n```';
					
					output += '------ @' + args[0].username + ' stats on this server\n';
					
					output += 'Total chars printed:                          ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                             ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                      ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sended:                          ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
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
			let q = 'SELECT "COUNT" as "cnt" FROM stats__chars_channel WHERE "UID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__words_channel WHERE "UID" = ' + ID +  ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__words_channel WHERE "UID" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__images_channel WHERE "UID" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_channel WHERE "UID" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_channel WHERE "UID" = ' + ID +  ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_channel WHERE "UID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1' +  ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_channel_d WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_channel_e WHERE "UID" = ' + ID + ';\
			';
			
			// Channel Stats by user
			let qU = 'SELECT "COUNT" as "cnt" FROM stats__uchars_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uwords_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__uwords_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uimages_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_uchannel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_uchannel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1' +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_channel_d WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_channel_e WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			';
			
			Postgres.query(q, function(err, data) {
				Postgres.query(qU, function(err, uData) {
					msg.channel.stopTyping();
					
					try {
						for (let i = 0; i <= 8; i++) {
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
						
						let MostUsedCommand_USER = uData[6].COMMAND || '<unknown>';
						let MostUsedCommand_count_USER = uData[6].summ || 0;
						let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
						let TotalPhrasesEdited_USER = uData[8].cnt || 0;
						
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
						output += 'Total images sended:                     ' + numeral(TotalImagesSend).format('0,0') + '\n';
						output += 'Total phrases said by all users:         ' + numeral(TotalPhrasesSaid).format('0,0') + '\n';
						output += 'Total phrases edited:                    ' + numeral(TotalPhrasesEdited).format('0,0') + '\n';
						output += 'Total phrases deleted:                   ' + numeral(TotalPhrasesDeleted).format('0,0') + '\n';
						output += 'Total amount of commands executed:       ' + numeral(TotalCommandsExecuted).format('0,0') + '\n';
						output += 'Most command used:                       ' + MostUsedCommand + '; Times Executed: ' + numeral(MostUsedCommand_count).format('0,0') + '\n';
						
						output += '------ Your stats on this channel\n';
						
						output += 'Total chars printed:                     ' + numeral(TotalChars_USER).format('0,0') + '\n';
						output += 'Total words said:                        ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
						output += 'Total unique words said:                 ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
						output += 'Total images sended:                     ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
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
			let q = 'SELECT SUM("COUNT") as "cnt" FROM stats__uchars_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__uwords_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__uwords_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uimages_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_channel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_uchannel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_uchannel WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1' +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_channel_d WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			SELECT "COUNT" as "cnt" FROM stats__uphrases_channel_e WHERE "UID" = ' + UID + ' AND "CHANNEL" = ' + ID +  ';\
			';
			
			Postgres.qeury(q, function(err, uData) {
				msg.channel.stopTyping();
				
				try {
					for (let i = 0; i <= 8; i++) {
						uData[i] = uData[i] || [];
						uData[i][0] = uData[i][0] || {};
					}
					
					let TotalChars_USER = uData[0].cnt || 0;
					let TotalWordsSaid_USER = uData[1].cnt || 0;
					let TotalUniqueWords_USER = uData[2].cnt || 0;
					let TotalImagesSend_USER = uData[3].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5].cnt || 0;
					
					let MostUsedCommand_USER = uData[6].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[6].summ || 0;
					let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
					let TotalPhrasesEdited_USER = uData[8].cnt || 0;
					
					let output = '\n```';
					
					output += '------ @' + args[0].username + ' stats on this channel\n';
					
					output += 'Total chars printed:                        ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                           ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                    ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sended:                        ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
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

DBot.RegisterCommand({
	name: 'stats',
	
	help_args: '[user]',
	desc: 'Displays generic statistics collected by me\nIf user is specified, prints this user global statistics',
	delay: 10,
	
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		msg.channel.startTyping();
		
		if (typeof args[0] != 'object') {
			let UserID = msg.author.id;
			let servers = 0;
			let channels = 0;
			let users = 0;
			let USERS_MEM = {};
			let ID = DBot.GetUserID(msg.author);
			
			let Servers = DBot.bot.guilds.array();
			
			for (let i in Servers) {
				servers++;
				var Channels = Servers[i].channels.array();
				var Users = Servers[i].members.array();
				
				for (var chann in Channels) {
					channels++;
				}
				
				for (var us in Users) {
					var user = Users[us].user;
					var uid = user.id;
					
					if (!USERS_MEM[uid]) {
						users++;
						USERS_MEM[uid] = true;
					}
				}
			}
			
			let mQuery = '\
			SELECT "COUNT" as "cnt" FROM stats__chars_client WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__words_client WHERE "UID" = ' + ID + ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__words_client WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__images_client WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_client WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_client WHERE "UID" = ' + ID + ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_client  WHERE "UID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			SELECT "COUNT" as "cnt" FROM stats__phrases_client_d WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_client_e WHERE "UID" = ' + ID + ';\
			';
			
			let mQueryG = '\
			SELECT SUM("COUNT") as "cnt" FROM stats__chars_client;\
			SELECT SUM("COUNT") as "cnt" FROM stats__words_client;\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__words_client;\
			SELECT SUM("COUNT") as "cnt" FROM stats__images_client;\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_client;\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_client;\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_client GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_client_d;\
			SELECT SUM("COUNT") as "cnt" FROM stats__phrases_client_e;\
			';
			
			// Global stats
			Postgres.query(mQueryG, function(err, data) {
			
			// Global stats for user
			Postgres.query(mQuery, function(err, uData, orig) {
				msg.channel.stopTyping();
				
				try {
					data = data || {};
					uData = uData || {};
					
					for (let i = 0; i <= 8; i++) {
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
					
					let MostUsedCommand_USER = uData[6].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[6].summ || 0;
					let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
					let TotalPhrasesEdited_USER = uData[8].cnt || 0;
					
					let output = '\n```';
					
					output += '------ Global stats\n';
					
					output += 'Total Servers:                           ' + numeral(servers).format('0,0') + '\n';
					output += 'Total Channels:                          ' + numeral(channels).format('0,0') + '\n';
					output += 'Total Users:                             ' + numeral(users).format('0,0') + '\n';
					output += 'Total chars printed by all users:        ' + numeral(TotalChars).format('0,0') + '\n';
					output += 'Total words said by all users:           ' + numeral(TotalWordsSaid).format('0,0') + '\n';
					output += 'Total unique words:                      ' + numeral(TotalUniqueWords).format('0,0') + '\n';
					output += 'Total images sended:                     ' + numeral(TotalImagesSend).format('0,0') + '\n';
					output += 'Total phrases said by all users:         ' + numeral(TotalPhrasesSaid).format('0,0') + '\n';
					output += 'Total phrases edited:                    ' + numeral(TotalPhrasesEdited).format('0,0') + '\n';
					output += 'Total phrases deleted:                   ' + numeral(TotalPhrasesDeleted).format('0,0') + '\n';
					output += 'Total amount of commands executed:       ' + numeral(TotalCommandsExecuted).format('0,0') + '\n';
					output += 'Most command used:                       ' + MostUsedCommand + '; Times Executed: ' + numeral(MostUsedCommand_count).format('0,0') + '\n';
					
					output += '------ Your global stats\n';
					
					output += 'Total chars printed:                     ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                        ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                 ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sended:                     ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
					output += 'Total phrases said:                      ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
					output += 'Total phrases edited:                    ' + numeral(TotalPhrasesEdited_USER).format('0,0') + '\n';
					output += 'Total phrases deleted:                   ' + numeral(TotalPhrasesDeleted_USER).format('0,0') + '\n';
					output += 'Total amount of commands executed:       ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
					output += 'Your favorite command:                   ' + MostUsedCommand_USER + '; Times Executed: ' + numeral(MostUsedCommand_count_USER).format('0,0') + '\n';
					
					output += '```\nAlso try sstats (server statistics) and cstats (channel statistics)';
					
					msg.reply(output);
				} catch(err) {
					console.error(err);
					msg.reply('<internal pony error>');
				}
			});
			});
		} else {
			let ID = DBot.GetUserID(args[0]);
			
			let mQuery = 'SELECT "COUNT" as "cnt" FROM stats__chars_client WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__words_client WHERE "UID" = ' + ID + ';\
			SELECT COUNT(DISTINCT "WORD") as "cnt" FROM stats__words_client WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__images_client WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_client WHERE "UID" = ' + ID + ';\
			SELECT SUM("COUNT") as "cnt" FROM stats__command_client WHERE "UID" = ' + ID + ';\
			SELECT "COMMAND", SUM("COUNT") as "summ" FROM stats__command_client  WHERE "UID" = ' + ID + ' GROUP BY "COMMAND" ORDER BY "summ" DESC LIMIT 1;\
			SELECT "COUNT" as "cnt" FROM stats__phrases_client_d WHERE "UID" = ' + ID + ';\
			SELECT "COUNT" as "cnt" FROM stats__phrases_client_e WHERE "UID" = ' + ID + ';\
			';
			
			// Global stats for user
			Postgres.query(mQuery, function(err, uData) {
				msg.channel.stopTyping();
				
				try {
					for (let i = 0; i <= 8; i++) {
						uData[i] = uData[i] || [];
						uData[i][0] = uData[i][0] || {};
					}
					
					let TotalChars_USER = uData[0].cnt || 0;
					let TotalWordsSaid_USER = uData[1].cnt || 0;
					let TotalUniqueWords_USER = uData[2].cnt || 0;
					let TotalImagesSend_USER = uData[3].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5].cnt || 0;
					
					let MostUsedCommand_USER = uData[6].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[6].summ || 0;
					let TotalPhrasesDeleted_USER = uData[7].cnt || 0;
					let TotalPhrasesEdited_USER = uData[8].cnt || 0;
					
					let output = '\n```';
					
					output += '------ @' + args[0].username + ' global stats\n';
					
					output += 'Total chars printed:                    ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                       ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sended:                    ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
					output += 'Total phrases said:                     ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
					output += 'Total phrases edited:                   ' + numeral(TotalPhrasesEdited_USER).format('0,0') + '\n';
					output += 'Total phrases deleted:                  ' + numeral(TotalPhrasesDeleted_USER).format('0,0') + '\n';
					output += 'Total amount of commands executed:      ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
					output += 'His favorite command:                   ' + MostUsedCommand_USER + '; Times Executed: ' + numeral(MostUsedCommand_count_USER).format('0,0') + '\n';
					
					output += '```';
					
					msg.reply(output);
				} catch(err) {
					console.error(err);
					msg.reply('<internal pony error>');
				}
			});
		}
	},
});

var utf8 = require('utf8');

DBot.RegisterCommand({
	name: 'top10',
	alias: ['top', 'top20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this server',
	delay: 5,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is PM x3';
		
		let page = Util.ToNumber(args[0]) || 1;
		
		if (page <= 0)
			return DBot.CommandError('what', 'top10', args, 1);
		
		let offset = (page - 1) * 20;
		
		msg.channel.startTyping();
		
		let ID = DBot.GetServerID(msg.channel.guild);
		let query = 'SELECT user_id."UID" as "USERID", user_id."ID" as "ID", member_names."NAME" as "USERNAME", stats__uphrases_server."COUNT" as "COUNT" FROM user_id, member_names, stats__uphrases_server WHERE stats__uphrases_server."UID" = user_id."ID" AND member_names."ID" = user_id."ID" AND stats__uphrases_server."USERVER" = ' + ID + ' ORDER BY "COUNT" DESC OFFSET ' + offset + ' LIMIT 20';
		
		Postgres.query(query, function(err, data) {
			try {
				if (!data[0]) {
					msg.channel.stopTyping();
					msg.reply('No data was returned in query');
					return;
				}
				
				let total = 0;
				let words = {};
				let uwords = {};
				
				let continueFunc = function() {
					msg.channel.stopTyping();
					
					let output = '\nRank. Username. Total Phrases Said.\n```';
					
					for (let i in data) {
						output += Util.AppendSpaces(Number(i) + 1 + (page - 1) * 20, 4) + Util.AppendSpaces(data[i].USERNAME, 20) + ' --- ' + Util.AppendSpaces(numeral(data[i].COUNT).format('0,0') + ' phrases', 15) + ' (' + numeral(words[data[i].ID]).format('0,0') + ' total words said; ' + numeral(uwords[data[i].ID]).format('0,0') + ' unique words)\n';
					}
					
					msg.reply(output + '```');
				}
				
				for (let row of data) {
					total++;
					
					Postgres.query('SELECT SUM(stats__uwords_server."COUNT") as "RESULT" FROM stats__uwords_server WHERE stats__uwords_server."UID" = ' + row.ID + ' AND stats__uwords_server."USERVER" = ' + ID, function(err, newData) {
						Postgres.query('SELECT COUNT(DISTINCT stats__uwords_server."WORD") as "RESULT" FROM stats__uwords_server WHERE stats__uwords_server."UID" = ' + row.ID + ' AND stats__uwords_server."USERVER" = ' + ID, function(err, newData2) {
							total--;
							words[row.ID] = newData[0].RESULT || 'WTF';
							uwords[row.ID] = newData2[0].RESULT;
							
							if (total == 0) {
								try {
									continueFunc();
								} catch(err) {
									msg.channel.stopTyping();
									console.error(err);
									msg.reply('<internal pony error>');
								}
							}
						});
					});
				}
			} catch(err) {
				msg.channel.stopTyping();
				console.error(err);
				msg.reply('<internal pony error>');
			}
		});
	},
});

DBot.RegisterCommand({
	name: 'ctop10',
	alias: ['ctop', 'ctop20'],
	
	help_args: '[page]',
	desc: 'Displays TOP10 of talkable persons on this channel',
	delay: 5,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is PM x3';
		
		let page = Util.ToNumber(args[0]) || 1;
		
		if (page <= 0)
			return DBot.CommandError('what', 'top10', args, 1);
		
		let offset = (page - 1) * 20;
		
		let ID = DBot.GetChannelID(msg.channel);
		
		let query = 'SELECT user_id."UID" as "USERID", user_id."ID" as "ID", member_names."NAME" as "USERNAME", stats__uphrases_channel."COUNT" as "COUNT" FROM user_id, member_names, stats__uphrases_channel WHERE stats__uphrases_channel."UID" = user_id."ID" AND member_names."ID" = user_id."ID" AND stats__uphrases_channel."CHANNEL" = ' + ID + ' ORDER BY "COUNT" DESC  OFFSET ' + offset + ' LIMIT 20';
		
		msg.channel.startTyping();
		
		Postgres.query(query, function(err, data) {
			try {
				if (!data[0]) {
					msg.channel.stopTyping();
					msg.reply('No data was returned in query');
					return;
				}
				
				let total = 0;
				let words = {};
				let uwords = {};
				
				let continueFunc = function() {
					msg.channel.stopTyping();
					let output = '\nRank. Username. Total Phrases Said.\n```';
					
					for (let i in data) {
						output += Util.AppendSpaces(Number(i) + 1 + (page - 1) * 20, 5) + Util.AppendSpaces(data[i].USERNAME, 20) + ' --- ' + Util.AppendSpaces(numeral(data[i].COUNT).format('0,0') + ' phrases', 15) + ' (' + numeral(words[data[i].ID]).format('0,0') + ' total words said; ' + numeral(uwords[data[i].ID]).format('0,0') + ' unique words)\n';
					}
					
					msg.reply(output + '```');
				}
				
				for (let row of data) {
					total++;
					
					Postgres.query('SELECT SUM(stats__uwords_channel."COUNT") as "RESULT" FROM stats__uwords_channel WHERE stats__uwords_channel."UID" = ' + row.ID + ' AND stats__uwords_channel."CHANNEL" = ' + ID, function(err2, newData) {
						Postgres.query('SELECT COUNT(DISTINCT stats__uwords_channel."WORD") as "RESULT" FROM stats__uwords_channel WHERE stats__uwords_channel."UID" = ' + row.ID + ' AND stats__uwords_channel."CHANNEL" = ' + ID, function(err1, newData2) {
							total--;
							
							if (err1) {
								console.error(err1);
							}
							
							if (err2) {
								console.error(err2);
							}
							
							try {
								words[row.ID] = newData && newData[0].RESULT || 'WTF';
								uwords[row.ID] = newData2 && newData2[0].RESULT;
							} catch(err) {
								msg.channel.stopTyping();
								console.error(err);
							}
							
							if (total == 0) {
								try {
									continueFunc();
								} catch(err) {
									msg.channel.stopTyping();
									console.error(err);
									msg.reply('<internal pony error>');
								}
							}
						});
					});
				}
			} catch(err) {
				msg.channel.stopTyping();
				console.error(err);
				msg.reply('<internal pony error>');
			}
		});
	},
});

var SPACES = function(len) {
	if (len <= 0)
		return '';
	
	var output = '';
	
	for (var i = 1; i <= len; i++) {
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
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_client WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data) {
				Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_client WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(msg.author) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
					msg.channel.stopTyping();
					try {
						var output = 'Global command usage statistics\nCommand                   Used times\n```';
						
						for (var i in data) {
							var row = data[i];
							
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\nYour command usage statistics\nCommand                        Used times\n```';
						
						for (var i in data2) {
							var row = data2[i];
							
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
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_client WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(args[0]) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
				msg.channel.stopTyping();
				
				try {
					var output = '@' + args[0].username + ' command usage statistics\nCommand                        Used times\n```';
					
					for (var i in data2) {
						var row = data2[i];
						
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
				Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_userver WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(msg.author) + '\' AND "USERVER" = \'' + DBot.GetServerID(msg.channel.guild) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
					msg.channel.stopTyping();
					
					try {
						var output = 'This server command usage statistics\nCommand                    Used times\n```';
						
						for (var i in data) {
							var row = data[i];
							
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\nYour command usage statistics on this server\nCommand                    Used times\n```';
						
						for (var i in data2) {
							var row = data2[i];
							
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
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_userver WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(args[0]) + '\' AND "USERVER" = \'' + DBot.GetServerID(msg.channel.guild) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
				msg.channel.stopTyping();
				
				try {
					var output = '@' + args[0].username + ' command usage statistics on this server\nCommand                    Used times\n```';
					
					for (var i in data2) {
						var row = data2[i];
						
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
				Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_uchannel WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(msg.author) + '\' AND "CHANNEL" = \'' + DBot.GetChannelID(msg.channel) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
					msg.channel.stopTyping();
					try {
						var output = 'This channel command usage statistics\nCommand                    Used times\n```';
						
						for (var i in data) {
							var row = data[i];
							
							output += row.COMMAND + SPACES(20 - row.COMMAND.length) + numeral(row.CALLED_TIMES).format('0,0') + '\n';
						}
						
						output += '```\nYour command usage statistics on this channel\nCommand                    Used times\n```';
						
						for (var i in data2) {
							var row = data2[i];
							
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
			Postgres.query('SELECT "COMMAND", SUM("COUNT") as "CALLED_TIMES" FROM stats__command_uchannel WHERE "COMMAND" != \'more\' AND "COMMAND" != \'retry\' AND "UID" = \'' + DBot.GetUserID(args[0]) + '\' AND "CHANNEL" = \'' + DBot.GetChannelID(msg.channel) + '\' GROUP BY "COMMAND" ORDER BY "CALLED_TIMES" DESC LIMIT 10', function(err, data2) {
				msg.channel.stopTyping();
				try {
					var output =  '@' + args[0].username + ' command usage statistics on this channel\nCommand                    Used times\n```';
					
					for (var i in data2) {
						var row = data2[i];
						
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

let serversQuery = `
SELECT
	server_id."UID" AS "UID",
	server_names."NAME" AS "NAME",
	stats__chars_server."COUNT" AS "TOTAL_CHARS",
	stats__phrases_server."COUNT" AS "TOTAL_PHRASES",
	SUM(stats__command_server."COUNT") AS "TOTAL_COMMANDS"
FROM
	server_names,
	server_id,
	stats__chars_server,
	stats__phrases_server,
	stats__command_server
WHERE
	server_id."ID" = server_names."ID" AND
	stats__chars_server."UID" = server_id."ID" AND
	stats__phrases_server."UID" = server_id."ID" AND
	stats__command_server."UID" = server_id."ID"
GROUP BY
	server_id."UID",
	server_id."ID",
	server_names."ID",
	server_names."NAME",
	stats__chars_server."UID",
	stats__phrases_server."UID",
	stats__command_server."UID",
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
		
		Postgres.query(serversQuery, function(err, data) {
			msg.channel.stopTyping();
			
			if (err) {
				msg.reply('<internal pony error>');
				return;
			}
			
			let output = '```\n' + Util.AppendSpaces('Server name', 60) + Util.AppendSpaces('Total phrases', 15) + Util.AppendSpaces('Chars printed', 15) + Util.AppendSpaces('Total commands executed', 10) + '\n';
			
			for (let row of data) {
				output += Util.AppendSpaces('<' + row.UID.trim() + '> ' + row.NAME, 60) + Util.AppendSpaces(numeral(row.TOTAL_PHRASES).format('0,0'), 15) + Util.AppendSpaces(numeral(row.TOTAL_CHARS).format('0,0'), 15) + Util.AppendSpaces(numeral(row.TOTAL_COMMANDS).format('0,0'), 10) + '\n'
			}
			
			msg.reply(output + '```');
		});
	}
});

let getsfn = function(name, num) {
	return function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		msg.channel.startTyping();
		
		let mode = (args[0] || 'server').toLowerCase();
		let mode1 = (args[1] || '').toLowerCase();
		
		if (mode == 'server') {
			let fuckingQuery = `
			SELECT
				member_names."NAME" AS "NAME",
				stats__server_get."NUMBER" AS "NUMBER",
				stats__server_get."STAMP" AS "STAMP"
			FROM
				member_names,
				member_id,
				stats__server_get
			WHERE
				stats__server_get."NUMBER" % ${num} = 0 AND
				member_names."ID" = stats__server_get."MEMBER" AND
				member_id."ID" = stats__server_get."MEMBER" AND
				member_id."SERVER" = ${msg.channel.guild.uid}
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
					output += Util.AppendSpaces(row.NAME, 30) + Util.AppendSpaces(numeral(row.NUMBER * 1000).format('0,0'), 10) + Util.AppendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ')', 10) + '\n'
				}
				
				msg.reply(output + '```');
			});
		} else if (mode == 'image' || mode == 'images' || mode == 'server' && (mode1 == 'image' || mode1 == 'images')) {
			let fuckingQuery = `
			SELECT
				member_names."NAME" AS "NAME",
				stats__server_get_image."NUMBER" AS "NUMBER",
				stats__server_get_image."STAMP" AS "STAMP"
			FROM
				member_names,
				member_id,
				stats__server_get_image
			WHERE
				stats__server_get_image."NUMBER" % ${num} = 0 AND
				member_names."ID" = stats__server_get_image."MEMBER" AND
				member_id."ID" = stats__server_get_image."MEMBER" AND
				member_id."SERVER" = ${msg.channel.guild.uid}
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
					output += Util.AppendSpaces(row.NAME, 30) + Util.AppendSpaces(numeral(row.NUMBER * 100).format('0,0'), 10) + Util.AppendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 100) + ')', 10) + '\n'
				}
				
				msg.reply(output + '```');
			});
		} else if (mode == 'channel') {
			let fuckingQuery = `
			SELECT
				member_names."NAME" AS "NAME",
				stats__channel_get."NUMBER" AS "NUMBER",
				stats__channel_get."STAMP" AS "STAMP"
			FROM
				member_names,
				member_id,
				stats__channel_get
			WHERE
				stats__channel_get."NUMBER" % ${num} = 0 AND
				stats__channel_get."CHANNEL" = ${msg.channel.uid} AND
				member_names."ID" = stats__channel_get."MEMBER" AND
				member_id."ID" = stats__channel_get."MEMBER" AND
				member_id."SERVER" = ${msg.channel.guild.uid}
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
					output += Util.AppendSpaces(row.NAME, 30) + Util.AppendSpaces(numeral(row.NUMBER * 1000).format('0,0'), 10) + Util.AppendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * 1000) + ')', 10) + '\n'
				}
				
				msg.reply(output + '```');
			});
		} else if (mode == 'channel' && (mode1 == 'image' || mode1 == 'images')) {
			let fuckingQuery = `
			SELECT
				member_names."NAME" AS "NAME",
				stats__channel_get_image."NUMBER" AS "NUMBER",
				stats__channel_get_image."STAMP" AS "STAMP"
			FROM
				member_names,
				member_id,
				stats__channel_get_image
			WHERE
				stats__channel_get_image."NUMBER" % ${num} = 0 AND
				stats__channel_get_image."CHANNEL" = ${msg.channel.uid} AND
				member_names."ID" = stats__channel_get_image."MEMBER" AND
				member_id."ID" = stats__channel_get_image."MEMBER" AND
				member_id."SERVER" = ${msg.channel.guild.uid}
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
					output += Util.AppendSpaces(row.NAME, 30) + Util.AppendSpaces(numeral(row.NUMBER * num * 100).format('0,0'), 10) + Util.AppendSpaces(moment.unix(row.STAMP).format('dddd, MMMM Do YYYY, HH:mm:ss') + ' (' + hDuration(Math.floor(CurTime() - row.STAMP) * num * 100) + ')', 10) + '\n'
				}
				
				msg.reply(output + '```');
			});
		} else {
			return DBot.CommandError('Unknown subcommand', name, args, 1);
		}
	}
}

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
	
	func: getsfn('gets', 1),
});

DBot.RegisterCommand({
	name: 'gets5',
	
	help_args: '',
	desc: 'Users who GET a round message (5k)',
	delay: 5,
	desc_full: descFullGet,
	
	func: getsfn('gets', 5),
});
