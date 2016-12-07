
/*
SELECT
	SUM(`stats__chars_server`.`COUNT`) as `TotalChars`,
	SUM(`stats__words_server`.`COUNT`) as `TotalWordsSaid`,
	COUNT(`stats__words_server`.`WORD`) as `TotalUniqueWords`,
	SUM(`stats__images_server`.`COUNT`) as `TotalImagesSend`,
	SUM(`stats__phrases_server`.`COUNT`) as `TotalPhrasesSaid`,
	SUM(`stats__command_server`.`COUNT`) as `TotalCommandsExecuted`,
	(
		SELECT
			SUM(`stats__command_server`.`COUNT`) as `MostUsedCommand`,
			SUM(`stats__command_server`.`COUNT`) as `MostUsedCommand_count`
		WHERE
			`UID` = ' + ID + '
		GROUP BY
			`COMMAND`
		ORDER BY
			`MostUsedCommand_count` DESC
		LIMIT 0, 1
	)
FROM
	`stats__chars_server`,
	`stats__images_server`,
	`stats__phrases_server`,
	`stats__command_server`,
	`stats__words_server`
WHERE
	`stats__chars_server`.`UID` = ' + ID;


(
SELECT
	SUM(`stats__chars_server`.`COUNT`) as `TotalChars`,
	SUM(`stats__words_server`.`COUNT`) as `TotalWordsSaid`,
	COUNT(`stats__words_server`.`WORD`) as `TotalUniqueWords`,
	SUM(`stats__images_server`.`COUNT`) as `TotalImagesSend`,
	SUM(`stats__phrases_server`.`COUNT`) as `TotalPhrasesSaid`,
	SUM(`stats__command_server`.`COUNT`) as `TotalCommandsExecuted`
FROM
	`stats__chars_server`,
	`stats__images_server`,
	`stats__phrases_server`,
	`stats__command_server`,
	`stats__words_server`
WHERE
	`stats__chars_server`.`UID` = '1' AND
	`stats__images_server`.`UID` = '1' AND
	`stats__phrases_server`.`UID` = '1' AND
	`stats__command_server`.`UID` = '1' AND
	`stats__words_server`.`UID` = '1'
)
UNION
(
	SELECT
		SUM(`stats__command_server`.`COUNT`) as `MostUsedCommand`,
		SUM(`stats__command_server`.`COUNT`) as `MostUsedCommand_count`
	FROM
		`stats__command_server`
	WHERE
		`stats__command_server`.`UID` = '1'
	GROUP BY
		`COMMAND`
	ORDER BY
		`MostUsedCommand_count` DESC
	LIMIT 0, 1
)


SELECT
	`stats__chars_server`.`COUNT` as `TotalChars`,
	(SELECT SUM(`stats__words_server`.`COUNT`) FROM `stats__words_server` WHERE `stats__words_server`.`UID` = 1) as `TotalWordsSaid`,
	COUNT(DISTINCT `stats__words_server`.`WORD`) as `TotalUniqueWords`,
	`stats__images_server`.`COUNT` as `TotalImagesSend`,
	`stats__phrases_server`.`COUNT` as `TotalPhrasesSaid`,
	(SELECT SUM(`stats__command_server`.`COUNT`) FROM `stats__command_server` WHERE `stats__command_server`.`UID` = 1) as `TotalCommandsExecuted`,
	(SELECT `stats__command_server`.`COMMAND` FROM `stats__command_server` WHERE `stats__command_server`.`UID` = '1' GROUP BY `stats__command_server`.`COMMAND` ORDER BY SUM(`COUNT`) DESC LIMIT 0, 1) as `MostUsedCommand`,
	(SELECT SUM(`stats__command_server`.`COUNT`) FROM `stats__command_server` WHERE `stats__command_server`.`COMMAND` = `MostUsedCommand` AND `stats__command_server`.`UID` = '1') as `MostUsedCommand_count`
FROM
	`stats__chars_server`,
	`stats__images_server`,
	`stats__phrases_server`,
	`stats__command_server`,
	`stats__words_server`
WHERE
	`stats__chars_server`.`UID` = '1' AND
	`stats__images_server`.`UID` = '1' AND
	`stats__phrases_server`.`UID` = '1' AND
	`stats__command_server`.`UID` = '1' AND
	`stats__words_server`.`UID` = '1'


(SELECT `stats__chars_channel`.`COUNT` as `DATA` FROM `stats__chars_channel` WHERE `UID` = 1) UNION
(SELECT SUM(`stats__words_channel`.`COUNT`) as `DATA` FROM `stats__words_channel` WHERE `UID` = 1) UNION
(SELECT COUNT(DISTINCT `stats__words_channel`.`WORD`) as `DATA` FROM `stats__words_channel` WHERE `UID` = 1) UNION
(SELECT `stats__images_channel`.`COUNT` as `DATA` FROM `stats__images_channel` WHERE `UID` = 1) UNION
(SELECT `stats__phrases_channel`.`COUNT` as `DATA` FROM `stats__phrases_channel` WHERE `UID` = 1) UNION
(SELECT SUM(`stats__command_channel`.`COUNT`) as `DATA` FROM `stats__command_channel` WHERE `UID` = 1) UNION
(SELECT `COMMAND` as `DATA` FROM `stats__command_channel` WHERE `UID` = 1 GROUP BY `COMMAND` ORDER BY SUM(`COUNT`) DESC LIMIT 0, 1) UNION
(SELECT SUM(`COUNT`) as `DATA` FROM `stats__command_channel` WHERE `UID` = 1 GROUP BY `COMMAND` ORDER BY `DATA` DESC LIMIT 0, 1)


(SELECT SUM(`stats__words_channel`.`COUNT`) FROM `stats__words_channel` WHERE `UID` = ' + ID + ') as `TotalWordsSaid`,\
(SELECT COUNT(DISTINCT `stats__words_channel`.`WORD`) FROM `stats__words_channel` WHERE `UID` = ' + ID + ') as `TotalUniqueWords`,\
(SELECT `stats__images_channel`.`COUNT` FROM `stats__images_channel` WHERE `UID` = ' + ID + ') as `TotalImagesSend`,\
(SELECT `stats__phrases_channel`.`COUNT` FROM `stats__phrases_channel` WHERE `UID` = ' + ID + ') as `TotalPhrasesSaid`,\
(SELECT SUM(`stats__command_channel`.`COUNT`) FROM `stats__command_channel` WHERE `UID` = ' + ID + ') as `TotalCommandsExecuted`,\
(SELECT `stats__command_channel`.`COMMAND` FROM `stats__command_channel` WHERE `UID` = ' + ID + ' GROUP BY `stats__command_channel`.`COMMAND` ORDER BY SUM(`COUNT`) DESC LIMIT 0, 1) as `MostUsedCommand`,\
(SELECT SUM(`stats__command_channel`.`COUNT`) FROM `stats__command_channel` WHERE `stats__command_channel`.`COMMAND` = `MostUsedCommand` AND `UID` = ' + ID + ') as `MostUsedCommand_count`\


'SELECT SUM(`COUNT`) as `cnt` FROM `stats__uchars_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID
'SELECT SUM(`COUNT`) as `cnt` FROM `stats__uwords_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID
'SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__uwords_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID
'SELECT SUM(`COUNT`) as `cnt` FROM `stats__uimages_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID
'SELECT SUM(`COUNT`) as `cnt` FROM `stats__uphrases_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID
'SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_userver` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID
'SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_userver` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1'
*/

hook.Add('OnHumanMessage', 'Statistics', function(msg) {
	if (!DBot.UserIsInitialized(msg.author))
		return;
	
	var channelID;
	var userID = DBot.GetUserID(msg.author);
	var serverID;
	var extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	var Words = msg.content.split(' ');
	var wordsC = Words.length;
	var length = msg.content.length;
	
	var Images;
	
	if (msg.attachments) {
		Images = msg.attachments.array().length;
	}
	
	try {
		if (extra) {
			channelID = DBot.GetChannelID(msg.channel);
			serverID = DBot.GetServerID(msg.channel.guild);
		}
	} catch(err) {
		extra = false;
	}
	
	DBot.query('INSERT INTO `stats__phrases_client` (`UID`, `COUNT`) VALUES (' + userID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
	DBot.query('INSERT INTO `stats__chars_client` (`UID`, `COUNT`) VALUES (' + userID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
	
	if (Images) {
		DBot.query('INSERT INTO `stats__images_client` (`UID`, `COUNT`) VALUES (' + userID + ', ' + Images + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + Images + ';');
	}
	
	if (extra) {
		DBot.query('INSERT INTO `stats__phrases_channel` (`UID`, `COUNT`) VALUES (' + channelID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__uphrases_channel` (`UID`, `CHANNEL`, `COUNT`) VALUES (' + userID + ', ' + channelID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__phrases_server` (`UID`, `COUNT`) VALUES (' + serverID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__uphrases_server` (`UID`, `USERVER`, `COUNT`) VALUES (' + userID + ', ' + serverID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		
		DBot.query('INSERT INTO `stats__chars_channel` (`UID`, `COUNT`) VALUES (' + channelID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
		DBot.query('INSERT INTO `stats__uchars_channel` (`UID`, `CHANNEL`, `COUNT`) VALUES (' + userID + ', ' + channelID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
		DBot.query('INSERT INTO `stats__chars_server` (`UID`, `COUNT`) VALUES (' + serverID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
		DBot.query('INSERT INTO `stats__uchars_server` (`UID`, `USERVER`, `COUNT`) VALUES (' + userID + ', ' + serverID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
		
		if (Images) {
			DBot.query('INSERT INTO `stats__images_channel` (`UID`, `COUNT`) VALUES (' + channelID + ', ' + Images + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + Images + ';');
			DBot.query('INSERT INTO `stats__uimages_channel` (`UID`, `CHANNEL`, `COUNT`) VALUES (' + userID + ', ' + channelID + ', ' + Images + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + Images + ';');
			DBot.query('INSERT INTO `stats__images_server` (`UID`, `COUNT`) VALUES (' + serverID + ', ' + Images + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + Images + ';');
			DBot.query('INSERT INTO `stats__uimages_server` (`UID`, `USERVER`, `COUNT`) VALUES (' + userID + ', ' + serverID + ', ' + Images + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + Images + ';');
		}
	}
	
	for (var i in Words) {
		var word = MySQL.escape(Words[i].toLowerCase().replace(new RegExp('[^a-zA-Z0-9à-ÿÀ-ß]', 'g'), ''));
		
		if (word == "''")
			continue;
		
		if (word == '')
			continue;
		
		if (word.length > 32)
			continue;
		
		DBot.query('INSERT INTO `stats__words_client` (`UID`, `WORD`, `COUNT`) VALUES (' + userID + ', ' + word + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		
		if (extra) {
			DBot.query('INSERT INTO `stats__words_channel` (`UID`, `WORD`, `COUNT`) VALUES (' + channelID + ', ' + word + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
			DBot.query('INSERT INTO `stats__uwords_channel` (`UID`, `CHANNEL`, `WORD`, `COUNT`) VALUES (' + userID + ', ' + channelID + ', ' + word + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
			DBot.query('INSERT INTO `stats__words_server` (`UID`, `WORD`, `COUNT`) VALUES (' + serverID + ', ' + word + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
			DBot.query('INSERT INTO `stats__uwords_server` (`UID`, `USERVER`, `WORD`, `COUNT`) VALUES (' + userID + ', ' + serverID + ', ' + word + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		}
	}
});

hook.Add('OnMessageEdit', 'Statistics', function(oldMessage, msg) {
	if (msg.author.bot)
		return;
	
	if (!DBot.UserIsInitialized(msg.author))
		return;
	
	var channelID;
	var userID = DBot.GetUserID(msg.author);
	var serverID;
	var extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	var Words = msg.content.split(' ');
	var wordsC = Words.length;
	var length = msg.content.length;
	
	try {
		if (extra) {
			channelID = DBot.GetChannelID(msg.channel);
			serverID = DBot.GetServerID(msg.channel.guild);
		}
	} catch(err) {
		extra = false;
	}
	
	DBot.query('INSERT INTO `stats__phrases_client_e` (`UID`, `COUNT`) VALUES (' + userID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
	
	if (extra) {
		DBot.query('INSERT INTO `stats__phrases_channel_e` (`UID`, `COUNT`) VALUES (' + channelID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__uphrases_channel_e` (`UID`, `CHANNEL`, `COUNT`) VALUES (' + userID + ', ' + channelID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__phrases_server_e` (`UID`, `COUNT`) VALUES (' + serverID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__uphrases_server_e` (`UID`, `USERVER`, `COUNT`) VALUES (' + userID + ', ' + serverID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
	}
});

hook.Add('OnMessageDeleted', 'Statistics', function(msg) {
	if (msg.author.bot)
		return;
	
	if (!DBot.UserIsInitialized(msg.author))
		return;
	
	var channelID;
	var userID = DBot.GetUserID(msg.author);
	var serverID;
	var extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	var Words = msg.content.split(' ');
	var wordsC = Words.length;
	var length = msg.content.length;
	
	try {
		if (extra) {
			channelID = DBot.GetChannelID(msg.channel);
			serverID = DBot.GetServerID(msg.channel.guild);
		}
	} catch(err) {
		extra = false;
	}
	
	DBot.query('INSERT INTO `stats__phrases_client_d` (`UID`, `COUNT`) VALUES (' + userID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
	DBot.query('INSERT INTO `stats__chars_client_d` (`UID`, `COUNT`) VALUES (' + userID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
	
	if (extra) {
		DBot.query('INSERT INTO `stats__phrases_channel_d` (`UID`, `COUNT`) VALUES (' + channelID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__uphrases_channel_d` (`UID`, `CHANNEL`, `COUNT`) VALUES (' + userID + ', ' + channelID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__phrases_server_d` (`UID`, `COUNT`) VALUES (' + serverID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__uphrases_server_d` (`UID`, `USERVER`, `COUNT`) VALUES (' + userID + ', ' + serverID + ', 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		
		DBot.query('INSERT INTO `stats__chars_channel_d` (`UID`, `COUNT`) VALUES (' + channelID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
		DBot.query('INSERT INTO `stats__uchars_channel_d` (`UID`, `CHANNEL`, `COUNT`) VALUES (' + userID + ', ' + channelID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
		DBot.query('INSERT INTO `stats__chars_server_d` (`UID`, `COUNT`) VALUES (' + serverID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
		DBot.query('INSERT INTO `stats__uchars_server_d` (`UID`, `USERVER`, `COUNT`) VALUES (' + userID + ', ' + serverID + ', ' + length + ') ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + ' + length +';');
	}
});

hook.Add('CommandExecuted', 'Statistics', function(commandID, user, args, cmd, msg) {
	var channelID;
	var serverID;
	var userID = DBot.GetUserID(user);
	var extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	
	try {
		if (extra) {
			channelID = DBot.GetChannelID(msg.channel);
			serverID = DBot.GetServerID(msg.channel.guild);
		}
	} catch(err) {
		extra = false;
	}
	
	DBot.query('INSERT INTO `stats__command_client` (`UID`, `COMMAND`, `COUNT`) VALUES (' + userID + ', "' + commandID + '", 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
	
	if (extra) {
		DBot.query('INSERT INTO `stats__command_channel` (`UID`, `COMMAND`, `COUNT`) VALUES (' + channelID + ', "' + commandID + '", 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__command_server` (`UID`, `COMMAND`, `COUNT`) VALUES (' + serverID + ', "' + commandID + '", 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		
		DBot.query('INSERT INTO `stats__command_uchannel` (`UID`, `CHANNEL`, `COMMAND`, `COUNT`) VALUES (' + userID + ', ' + channelID + ', "' + commandID + '", 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
		DBot.query('INSERT INTO `stats__command_userver` (`UID`, `USERVER`, `COMMAND`, `COUNT`) VALUES (' + userID + ', ' + serverID + ', "' + commandID + '", 1) ON DUPLICATE KEY UPDATE `COUNT` = `COUNT` + 1;');
	}
});

var numeral = require('numeral');

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
			
			let q = 'SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_server` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_server` WHERE `UID` = ' + ID + ';\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_server` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_server` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_server` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_server` WHERE `UID` = ' + ID + ';\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_server` WHERE `UID` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1;';
			
			let qU = 'SELECT SUM(`COUNT`) as `cnt` FROM `stats__uchars_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uwords_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__uwords_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uimages_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uphrases_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_userver` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_userver` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1'+ ';';
			
			// Generic Server Stats
			MySQLM.query(q, function(err, data) {
				
				// Server Stats by user
				MySQLM.query(qU, function(err, uData) {
					msg.channel.stopTyping();
					
					try {
						for (let i = 0; i <= 6; i++) {
							uData[i] = uData[i] || [];
							data[i] = data[i] || [];
							uData[i][0] = uData[i][0] || {};
							data[i][0] = data[i][0] || {};
						}
						
						data = data || {};
						uData = uData || {};
						
						let TotalChars = data[0][0].cnt || 0;
						let TotalWordsSaid = data[1][0].cnt || 0;
						let TotalUniqueWords = data[2][0].cnt || 0;
						let TotalImagesSend = data[3][0].cnt || 0;
						let TotalPhrasesSaid = data[4][0].cnt || 0;
						let TotalCommandsExecuted = data[5][0].cnt || 0;
						
						let MostUsedCommand = data[6][0].COMMAND || '<unknown>';
						let MostUsedCommand_count = data[6][0].summ || 0;
						
						let TotalChars_USER = uData[0][0].cnt || 0;
						let TotalWordsSaid_USER = uData[1][0].cnt || 0;
						let TotalUniqueWords_USER = uData[2][0].cnt || 0;
						let TotalImagesSend_USER = uData[3][0].cnt || 0;
						let TotalPhrasesSaid_USER = uData[4][0].cnt || 0;
						let TotalCommandsExecuted_USER = uData[5][0].cnt || 0;
						
						let MostUsedCommand_USER = uData[6][0].COMMAND || '<unknown>';
						let MostUsedCommand_count_USER = uData[6][0].summ || 0;
						
						let output = '\n```';
						
						output += '------ Infos\n';
						output += 'Server Name:                                     ' + msg.channel.guild.name + '\n';
						output += 'Server ID:                                       ' + msg.channel.guild.id + '\n';
						output += 'Server Owner:                                    @' + msg.channel.guild.owner.user.username + '\n';
						output += 'Server ID in my Database:                        ' + ID + '\n';
						output += 'Server region:                                   ' + msg.channel.guild.region + '\n';
						output += 'Server default channel:                          #' + msg.channel.guild.defaultChannel.name + '\n';
						output += 'Server avatar URL:                               ' + (msg.channel.guild.iconURL || '<no avatar>') + '\n';
						output += 'Server is large?:                                ' + (msg.channel.guild.large && 'yes' || 'no') + '\n';
						output += '------ Statistics\n';
						
						output += 'Total Channels on this server:                   ' + numeral(channels).format('0,0') + '\n';
						output += 'Total Users on this server:                      ' + numeral(users).format('0,0') + '\n';
						output += 'Total chars printed by all users:                ' + numeral(TotalChars).format('0,0') + '\n';
						output += 'Total words said by all users:                   ' + numeral(TotalWordsSaid).format('0,0') + '\n';
						output += 'Total unique words:                              ' + numeral(TotalUniqueWords).format('0,0') + '\n';
						output += 'Total images sended:                             ' + numeral(TotalImagesSend).format('0,0') + '\n';
						output += 'Total phrases said by all users:                 ' + numeral(TotalPhrasesSaid).format('0,0') + '\n';
						output += 'Total amount of commands executed:               ' + numeral(TotalCommandsExecuted).format('0,0') + '\n';
						output += 'Most command used:                               ' + MostUsedCommand + '; Times Executed: ' + numeral(MostUsedCommand_count).format('0,0') + '\n';
						
						output += '------ Your stats on this server\n';
						
						output += 'Total chars printed by you:                      ' + numeral(TotalChars_USER).format('0,0') + '\n';
						output += 'Total words said by you:                         ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
						output += 'Total unique words said by you:                  ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
						output += 'Total images sended by you:                      ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
						output += 'Total phrases said by you:                       ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
						output += 'Total amount of commands executed by you:        ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
						output += 'Most command used by you:                        ' + MostUsedCommand_USER + '; Times Executed: ' + MostUsedCommand_count_USER + '\n';
						
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
			
			let qU = 'SELECT SUM(`COUNT`) as `cnt` FROM `stats__uchars_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uwords_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__uwords_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uimages_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uphrases_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_userver` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ';\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_userver` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1'+ ';';
			
			// Server Stats by user
			MySQLM.query(qU, function(err, uData) {
				msg.channel.stopTyping();
				
				try {
					for (let i = 0; i <= 6; i++) {
						uData[i] = uData[i] || [];
						uData[i][0] = uData[i][0] || {};
					}
					
					uData = uData || {};
					
					let TotalChars_USER = uData[0][0].cnt || 0;
					let TotalWordsSaid_USER = uData[1][0].cnt || 0;
					let TotalUniqueWords_USER = uData[2][0].cnt || 0;
					let TotalImagesSend_USER = uData[3][0].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4][0].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5][0].cnt || 0;
					
					let MostUsedCommand_USER = uData[6][0].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[6][0].summ || 0;
					
					let output = '\n```';
					
					output += '------ @' + args[0].username + ' stats on this server\n';
					
					output += 'Total chars printed:                          ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                             ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                      ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sended:                          ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
					output += 'Total phrases said:                           ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
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
			let q = 'SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_channel` WHERE `UID` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_channel` WHERE `UID` = ' + ID +  ';\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_channel` WHERE `UID` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_channel` WHERE `UID` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_channel` WHERE `UID` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_channel` WHERE `UID` = ' + ID +  ';\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_channel` WHERE `UID` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1' +  ';';
			
			// Channel Stats by user
			let qU = 'SELECT SUM(`COUNT`) as `cnt` FROM `stats__uchars_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uwords_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__uwords_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uimages_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uphrases_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_uchannel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_uchannel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1' +  ';';
			
			MySQLM.query(q, function(err, data) {
				MySQLM.query(qU, function(err, uData) {
					msg.channel.stopTyping();
					
					try {
						for (let i = 0; i <= 6; i++) {
							uData[i] = uData[i] || [];
							data[i] = data[i] || [];
							uData[i][0] = uData[i][0] || {};
							data[i][0] = data[i][0] || {};
						}
						
						data = data || {};
						uData = uData || {};
						
						let TotalChars = data[0][0].cnt || 0;
						let TotalWordsSaid = data[1][0].cnt || 0;
						let TotalUniqueWords = data[2][0].cnt || 0;
						let TotalImagesSend = data[3][0].cnt || 0;
						let TotalPhrasesSaid = data[4][0].cnt || 0;
						let TotalCommandsExecuted = data[5][0].cnt || 0;
						
						let MostUsedCommand = data[6][0].COMMAND || '<unknown>';
						let MostUsedCommand_count = data[6][0].summ || 0;
						
						let TotalChars_USER = uData[0][0].cnt || 0;
						let TotalWordsSaid_USER = uData[1][0].cnt || 0;
						let TotalUniqueWords_USER = uData[2][0].cnt || 0;
						let TotalImagesSend_USER = uData[3][0].cnt || 0;
						let TotalPhrasesSaid_USER = uData[4][0].cnt || 0;
						let TotalCommandsExecuted_USER = uData[5][0].cnt || 0;
						
						let MostUsedCommand_USER = uData[6][0].COMMAND || '<unknown>';
						let MostUsedCommand_count_USER = uData[6][0].summ || 0;
						
						let output = '\n```';
						
						output += '------ Infos\n';
						output += 'Channel Name:                                 ' + msg.channel.name + '\n';
						output += 'Channel ID:                                   ' + msg.channel.id + '\n';
						output += 'Channel ID in my Database:                    ' + ID + '\n';
						output += 'Is default channel?:                          ' + (msg.channel.guild.defaultChannel.id == msg.channel.id && 'yes' || 'no') + '\n';
						output += '------ Statistics\n';
						
						output += 'Total chars printed by all users:             ' + numeral(TotalChars).format('0,0') + '\n';
						output += 'Total words said by all users:                ' + numeral(TotalWordsSaid).format('0,0') + '\n';
						output += 'Total unique words:                           ' + numeral(TotalUniqueWords).format('0,0') + '\n';
						output += 'Total images sended:                          ' + numeral(TotalImagesSend).format('0,0') + '\n';
						output += 'Total phrases said by all users:              ' + numeral(TotalPhrasesSaid).format('0,0') + '\n';
						output += 'Total amount of commands executed:            ' + numeral(TotalCommandsExecuted).format('0,0') + '\n';
						output += 'Most command used:                            ' + MostUsedCommand + '; Times Executed: ' + numeral(MostUsedCommand_count).format('0,0') + '\n';
						
						output += '------ Your stats on this channel\n';
						
						output += 'Total chars printed by you:                   ' + numeral(TotalChars_USER).format('0,0') + '\n';
						output += 'Total words said by you:                      ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
						output += 'Total unique words said by you:               ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
						output += 'Total images sended by you:                   ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
						output += 'Total phrases said by you:                    ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
						output += 'Total amount of commands executed by you:     ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
						output += 'Most command used by you:                     ' + MostUsedCommand_USER + '; Times Executed: ' + numeral(MostUsedCommand_count_USER).format('0,0') + '\n';
						
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
			let q = 'SELECT SUM(`COUNT`) as `cnt` FROM `stats__uchars_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uwords_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__uwords_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uimages_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__uphrases_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_uchannel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID +  ';\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_uchannel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1' +  ';';
			
			MySQLM.qeury(q, function(err, uData) {
				msg.channel.stopTyping();
				
				try {
					for (let i = 0; i <= 6; i++) {
						uData[i] = uData[i] || [];
						uData[i][0] = uData[i][0] || {};
					}
					
					uData = uData || {};
					
					let TotalChars_USER = uData[0][0].cnt || 0;
					let TotalWordsSaid_USER = uData[1][0].cnt || 0;
					let TotalUniqueWords_USER = uData[2][0].cnt || 0;
					let TotalImagesSend_USER = uData[3][0].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4][0].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5][0].cnt || 0;
					
					let MostUsedCommand_USER = uData[6][0].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[6][0].summ || 0;
					
					let output = '\n```';
					
					output += '------ @' + args[0].username + ' stats on this channel\n';
					
					output += 'Total chars printed:                        ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                           ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                    ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sended:                        ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
					output += 'Total phrases said:                         ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
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
			
			let mQuery = 'SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_client` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_client` WHERE `UID` = ' + ID + ';\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_client` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_client` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_client` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_client` WHERE `UID` = ' + ID + ';\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_client`  WHERE `UID` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1;\
			';
			
			let mQueryG = '\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_client`;\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_client`;\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_client`;\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_client`;\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_client`;\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_client`;\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_client` GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1;\
			';
			
			// Global stats
			MySQLM.query(mQueryG, function(err, data) {
			
			// Global stats for user
			MySQLM.query(mQuery, function(err, uData) {
				msg.channel.stopTyping();
				try {
					for (let i = 0; i <= 6; i++) {
						uData[i] = uData[i] || [];
						data[i] = data[i] || [];
						uData[i][0] = uData[i][0] || {};
						data[i][0] = data[i][0] || {};
					}
					
					data = data || {};
					uData = uData || {};
					
					let TotalChars = data[0][0].cnt || 0;
					let TotalWordsSaid = data[1][0].cnt || 0;
					let TotalUniqueWords = data[2][0].cnt || 0;
					let TotalImagesSend = data[3][0].cnt || 0;
					let TotalPhrasesSaid = data[4][0].cnt || 0;
					let TotalCommandsExecuted = data[5][0].cnt || 0;
					
					let MostUsedCommand = data[6][0].COMMAND || '<unknown>';
					let MostUsedCommand_count = data[6][0].summ || 0;
					
					let TotalChars_USER = uData[0][0].cnt || 0;
					let TotalWordsSaid_USER = uData[1][0].cnt || 0;
					let TotalUniqueWords_USER = uData[2][0].cnt || 0;
					let TotalImagesSend_USER = uData[3][0].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4][0].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5][0].cnt || 0;
					
					let MostUsedCommand_USER = uData[6][0].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[6][0].summ || 0;
					
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
					output += 'Total amount of commands executed:       ' + numeral(TotalCommandsExecuted).format('0,0') + '\n';
					output += 'Most command used:                       ' + MostUsedCommand + '; Times Executed: ' + numeral(MostUsedCommand_count).format('0,0') + '\n';
					
					output += '------ Your global stats\n';
					
					output += 'Total chars printed by you:              ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said by you:                 ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said by you:          ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sended by you:              ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
					output += 'Total phrases said by you:               ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
					output += 'Total amount of commands executed by you: ' + numeral(TotalCommandsExecuted_USER).format('0,0') + '\n';
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
			
			let mQuery = 'SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_client` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_client` WHERE `UID` = ' + ID + ';\
			SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_client` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_client` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_client` WHERE `UID` = ' + ID + ';\
			SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_client` WHERE `UID` = ' + ID + ';\
			SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_client`  WHERE `UID` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1;\
			';
			
			// Global stats for user
			MySQLM.query(mQuery, function(err, uData) {
				msg.channel.stopTyping();
				
				try {
					for (let i = 0; i <= 6; i++) {
						uData[i] = uData[i] || [];
						uData[i][0] = uData[i][0] || {};
					}
					
					let TotalChars_USER = uData[0][0].cnt || 0;
					let TotalWordsSaid_USER = uData[1][0].cnt || 0;
					let TotalUniqueWords_USER = uData[2][0].cnt || 0;
					let TotalImagesSend_USER = uData[3][0].cnt || 0;
					let TotalPhrasesSaid_USER = uData[4][0].cnt || 0;
					let TotalCommandsExecuted_USER = uData[5][0].cnt || 0;
					
					let MostUsedCommand_USER = uData[6][0].COMMAND || '<unknown>';
					let MostUsedCommand_count_USER = uData[6][0].summ || 0;
					
					let output = '\n```';
					
					output += '------ @' + args[0].username + ' global stats\n';
					
					output += 'Total chars printed:                    ' + numeral(TotalChars_USER).format('0,0') + '\n';
					output += 'Total words said:                       ' + numeral(TotalWordsSaid_USER).format('0,0') + '\n';
					output += 'Total unique words said:                ' + numeral(TotalUniqueWords_USER).format('0,0') + '\n';
					output += 'Total images sended:                    ' + numeral(TotalImagesSend_USER).format('0,0') + '\n';
					output += 'Total phrases said:                     ' + numeral(TotalPhrasesSaid_USER).format('0,0') + '\n';
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
	
	help_args: '[@mention]',
	desc: 'Displays TOP10 of talkable persons on this server\nTo get associated user-ID table, type as argument "1"\n**W.A.R.N.I.N.G**: Associated table can trigger **mention spam**!',
	delay: 10,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is PM x3';
		
		msg.channel.startTyping();
		
		var ID = DBot.GetServerID(msg.channel.guild);
		var query = 'SELECT `user_id`.`UID` as `USERID`, `user_id`.`ID` as `ID`, `user_names`.`USERNAME` as `USERNAME`, `stats__uphrases_server`.`COUNT` as `COUNT` FROM `user_id`, `user_names`, `stats__uphrases_server` WHERE `stats__uphrases_server`.`UID` = `user_id`.`ID` AND `user_names`.`ID` = `user_id`.`ID` AND `stats__uphrases_server`.`USERVER` = ' + ID + ' ORDER BY `COUNT` DESC LIMIT 0, 10';
		
		MySQL.query(query, function(err, data) {
			try {
				var total = 0;
				var words = {};
				var uwords = {};
				
				var continueFunc = function() {
					msg.channel.stopTyping();
					var output = '\nRank. Username. Total Phrases Said.\n';
					
					if (args[0]) {
						for (var i in data) {
							output += (Number(i) + 1) + '    <@' + data[i].USERID + '> --- ' + numeral(data[i].COUNT).format('0,0') + ' phrases (' + numeral(words[data[i].ID]).format('0,0') + ' total words said; ' + numeral(uwords[data[i].ID]).format('0,0') + ' unique words)\n';
						}
					} else {
						for (var i in data) {
							output += (Number(i) + 1) + '    ' + utf8.decode(data[i].USERNAME) + ' --- ' + numeral(data[i].COUNT).format('0,0') + ' phrases (' + numeral(words[data[i].ID]).format('0,0') + ' total words said; ' + numeral(uwords[data[i].ID]).format('0,0') + ' unique words)\n';
						}
					}
					
					msg.reply(output);
				}
				
				for (let row of data) {
					total++;
					
					MySQL.query('SELECT SUM(`stats__uwords_server`.`COUNT`) as `RESULT` FROM `stats__uwords_server` WHERE `stats__uwords_server`.`UID` = ' + row.ID + ' AND `stats__uwords_server`.`USERVER` = ' + ID, function(err, newData) {
						MySQL.query('SELECT COUNT(DISTINCT `stats__uwords_server`.`WORD`) as `RESULT` FROM `stats__uwords_server` WHERE `stats__uwords_server`.`UID` = ' + row.ID + ' AND `stats__uwords_server`.`USERVER` = ' + ID, function(err, newData2) {
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
	
	help_args: '[@mention]',
	desc: 'Displays TOP10 of talkable persons on this channel\nTo get associated user-ID table, type as argument "1"\n**W.A.R.N.I.N.G**: Associated table can trigger **mention spam**!',
	delay: 10,
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is PM x3';
		
		var ID = DBot.GetChannelID(msg.channel);
		var query = 'SELECT `user_id`.`UID` as `USERID`, `user_id`.`ID` as `ID`, `user_names`.`USERNAME` as `USERNAME`, `stats__uphrases_channel`.`COUNT` as `COUNT` FROM `user_id`, `user_names`, `stats__uphrases_channel` WHERE `stats__uphrases_channel`.`UID` = `user_id`.`ID` AND `user_names`.`ID` = `user_id`.`ID` AND `stats__uphrases_channel`.`CHANNEL` = ' + ID + ' ORDER BY `COUNT` DESC LIMIT 0, 10';
		
		msg.channel.startTyping();
		
		MySQL.query(query, function(err, data) {
			try {
				var total = 0;
				var words = {};
				var uwords = {};
				
				var continueFunc = function() {
					msg.channel.stopTyping();
					var output = '\nRank. Username. Total Phrases Said.\n';
					
					if (args[0]) {
						for (var i in data) {
							output += (Number(i) + 1) + '    <@' + data[i].USERID + '> --- ' + numeral(data[i].COUNT).format('0,0') + ' phrases (' + numeral(words[data[i].ID]).format('0,0') + ' total words said; ' + numeral(uwords[data[i].ID]).format('0,0') + ' unique words)\n';
						}
					} else {
						for (var i in data) {
							output += (Number(i) + 1) + '    ' + utf8.decode(data[i].USERNAME) + ' --- ' + numeral(data[i].COUNT).format('0,0') + ' phrases (' + numeral(words[data[i].ID]).format('0,0') + ' total words said; ' + numeral(uwords[data[i].ID]).format('0,0') + ' unique words)\n';
						}
					}
					
					msg.reply(output);
				}
				
				for (let row of data) {
					total++;
					
					MySQL.query('SELECT SUM(`stats__uwords_channel`.`COUNT`) as `RESULT` FROM `stats__uwords_channel` WHERE `stats__uwords_channel`.`UID` = ' + row.ID + ' AND `stats__uwords_channel`.`CHANNEL` = ' + ID, function(err2, newData) {
						MySQL.query('SELECT COUNT(DISTINCT `stats__uwords_channel`.`WORD`) as `RESULT` FROM `stats__uwords_channel` WHERE `stats__uwords_channel`.`UID` = ' + row.ID + ' AND `stats__uwords_channel`.`CHANNEL` = ' + ID, function(err1, newData2) {
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
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_client` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data) {
				MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_client` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(msg.author) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_client` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(args[0]) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_server` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetServerID(msg.channel.guild) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data) {
				MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_userver` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(msg.author) + '" AND `USERVER` = "' + DBot.GetServerID(msg.channel.guild) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_userver` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(args[0]) + '" AND `USERVER` = "' + DBot.GetServerID(msg.channel.guild) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_channel` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetChannelID(msg.channel) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data) {
				MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_uchannel` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(msg.author) + '" AND `CHANNEL` = "' + DBot.GetChannelID(msg.channel) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_uchannel` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(args[0]) + '" AND `CHANNEL` = "' + DBot.GetChannelID(msg.channel) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
