
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

// Total words said
DBot.DefineMySQLTable('stats__words_client', 'UID INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD)');
DBot.DefineMySQLTable('stats__words_channel', 'UID INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD)');
DBot.DefineMySQLTable('stats__words_server', 'UID INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD)');

// Total Phrases said
DBot.DefineMySQLTable('stats__phrases_client', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__phrases_channel', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__phrases_server', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');

// Total Phrases edited
DBot.DefineMySQLTable('stats__phrases_client_e', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__phrases_channel_e', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__phrases_server_e', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');

// Total Phrases deleted
DBot.DefineMySQLTable('stats__phrases_client_d', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__phrases_channel_d', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__phrases_server_d', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');

// Total Images posted
DBot.DefineMySQLTable('stats__images_client', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__images_channel', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__images_server', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');

// Total chars printed
DBot.DefineMySQLTable('stats__chars_client', 'UID INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__chars_channel', 'UID INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__chars_server', 'UID INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID)');

// Total chars printed by users on servers
DBot.DefineMySQLTable('stats__uchars_channel', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID, CHANNEL)');
DBot.DefineMySQLTable('stats__uchars_server', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID, USERVER)');

// Total chars deleted
DBot.DefineMySQLTable('stats__chars_client_d', 'UID INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__chars_channel_d', 'UID INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__chars_server_d', 'UID INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID)');

// Total chars deleted by users on servers
DBot.DefineMySQLTable('stats__uchars_channel_d', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID, CHANNEL)');
DBot.DefineMySQLTable('stats__uchars_server_d', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, COUNT BIGINT NOT NULL, PRIMARY KEY (UID, USERVER)');

// Total words said on servers by users
DBot.DefineMySQLTable('stats__uwords_channel', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD, CHANNEL)');
DBot.DefineMySQLTable('stats__uwords_server', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD, USERVER)');

// Total phrases said on servers by users
DBot.DefineMySQLTable('stats__uphrases_channel', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, CHANNEL)');
DBot.DefineMySQLTable('stats__uphrases_server', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, USERVER)');

// Total phrases said on servers by users and edited
DBot.DefineMySQLTable('stats__uphrases_channel_e', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, CHANNEL)');
DBot.DefineMySQLTable('stats__uphrases_server_e', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, USERVER)');

// Total phrases said on servers by users and delited
DBot.DefineMySQLTable('stats__uphrases_channel_d', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, CHANNEL)');
DBot.DefineMySQLTable('stats__uphrases_server_d', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, USERVER)');

// Total images posted on servers by users
DBot.DefineMySQLTable('stats__uimages_channel', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, CHANNEL)');
DBot.DefineMySQLTable('stats__uimages_server', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, USERVER)');

// Total commands used
DBot.DefineMySQLTable('stats__command_client', 'UID INTEGER NOT NULL, COMMAND VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, COMMAND)');
DBot.DefineMySQLTable('stats__command_channel', 'UID INTEGER NOT NULL, COMMAND VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, COMMAND)');
DBot.DefineMySQLTable('stats__command_server', 'UID INTEGER NOT NULL, COMMAND VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, COMMAND)');

// Total commands used on servers by users
DBot.DefineMySQLTable('stats__command_uchannel', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, COMMAND VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, CHANNEL, COMMAND)');
DBot.DefineMySQLTable('stats__command_userver', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, COMMAND VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, USERVER, COMMAND)');

hook.Add('OnHumanMessage', 'Statistics', function(msg) {
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
	
	if (extra) {
		channelID = DBot.GetChannelID(msg.channel);
		serverID = DBot.GetServerID(msg.channel.guild);
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
	var channelID;
	var userID = DBot.GetUserID(msg.author);
	var serverID;
	var extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	var Words = msg.content.split(' ');
	var wordsC = Words.length;
	var length = msg.content.length;
	
	if (extra) {
		channelID = DBot.GetChannelID(msg.channel);
		serverID = DBot.GetServerID(msg.channel.guild);
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
	var channelID;
	var userID = DBot.GetUserID(msg.author);
	var serverID;
	var extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	var Words = msg.content.split(' ');
	var wordsC = Words.length;
	var length = msg.content.length;
	
	if (extra) {
		channelID = DBot.GetChannelID(msg.channel);
		serverID = DBot.GetServerID(msg.channel.guild);
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

hook.Add('CommandExecuted', 'Statistics', function(commandID, user, args, cmd, rawmessage, msg) {
	var channelID;
	var serverID;
	var userID = DBot.GetUserID(user);
	var extra = msg.channel.guild != undefined && msg.channel.type != 'dm';
	
	if (extra) {
		channelID = DBot.GetChannelID(msg.channel);
		serverID = DBot.GetServerID(msg.channel.guild);
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
	
	help_args: '',
	desc: 'Displays this server statistics collected by me',
	delay: 10,
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is a PM! x3';
		
		var server = msg.channel.guild;
		var ID = DBot.GetServerID(server);
		var UID = DBot.GetUserID(msg.author);
		
		var Channels = server.channels.array();
		var Users = server.members.array();
		var channels = Channels.length;
		var users = Users.length;
		
		// Generic Server Stats
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_server` WHERE `UID` = ' + ID, function(err, data) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_server` WHERE `UID` = ' + ID, function(err, data2) {
		MySQL.query('SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_server` WHERE `UID` = ' + ID, function(err, data3) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_server` WHERE `UID` = ' + ID, function(err, data4) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_server` WHERE `UID` = ' + ID, function(err, data5) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_server` WHERE `UID` = ' + ID, function(err, data6) {
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_server` WHERE `UID` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1', function(err, data7) {
		
		// Server Stats by user
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__uchars_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID, function(err, data8) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__uwords_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID, function(err, data9) {
		MySQL.query('SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__uwords_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID, function(err, data10) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__uimages_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID, function(err, data11) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__uphrases_server` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID, function(err, data12) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_userver` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID, function(err, data13) {
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_userver` WHERE `UID` = ' + UID + ' AND `USERVER` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1', function(err, data14) {
			try {
				data = data || {};
				data2 = data2 || {};
				data3 = data3 || {};
				data4 = data4 || {};
				data5 = data5 || {};
				data6 = data6 || {};
				data7 = data7 || {};
				data8 = data8 || {};
				data9 = data9 || {};
				data10 = data10 || {};
				data11 = data11 || {};
				data12 = data12 || {};
				data13 = data13 || {};
				data14 = data14 || {};
				
				var TotalChars = data[0] && data[0].cnt || 0;
				var TotalWordsSaid = data2[0] && data2[0].cnt || 0;
				var TotalUniqueWords = data3[0] && data3[0].cnt || 0;
				var TotalImagesSend = data4[0] && data4[0].cnt || 0;
				var TotalPhrasesSaid = data5[0] && data5[0].cnt || 0;
				var TotalCommandsExecuted = data6[0] && data6[0].cnt || 0;
				
				var MostUsedCommand = data7[0] && data7[0].COMMAND || '<unknown>';
				var MostUsedCommand_count = data7[0] && data7[0].summ || 0;
				
				var TotalChars_USR = data8[0] && data8[0].cnt || 0;
				var TotalWordsSaid_USR = data9[0] && data9[0].cnt || 0;
				var TotalUniqueWords_USR = data10[0] && data10[0].cnt || 0;
				var TotalImagesSend_USR = data11[0] && data11[0].cnt || 0;
				var TotalPhrasesSaid_USR = data12[0] && data12[0].cnt || 0;
				var TotalCommandsExecuted_USR = data13[0] && data13[0].cnt || 0;
				
				var MostUsedCommand_USR = data14[0] && data14[0].COMMAND || '<unknown>';
				var MostUsedCommand_count_USR = data14[0] && data14[0].summ || 0;
				
				var output = '\n```';
				
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
				
				output += 'Total chars printed by you:                      ' + numeral(TotalChars_USR).format('0,0') + '\n';
				output += 'Total words said by you:                         ' + numeral(TotalWordsSaid_USR).format('0,0') + '\n';
				output += 'Total unique words said by you:                  ' + numeral(TotalUniqueWords_USR).format('0,0') + '\n';
				output += 'Total images sended by you:                      ' + numeral(TotalImagesSend_USR).format('0,0') + '\n';
				output += 'Total phrases said by you:                       ' + numeral(TotalPhrasesSaid_USR).format('0,0') + '\n';
				output += 'Total amount of commands executed by you:        ' + numeral(TotalCommandsExecuted_USR).format('0,0') + '\n';
				output += 'Most command used by you:                        ' + MostUsedCommand_USR + '; Times Executed: ' + MostUsedCommand_count_USR + '\n';
				
				output += '```\nAlso try stats (global statistics) and cstats (channel statistics)';
				
				msg.reply(output);
			} catch(err) {
				console.error(err);
				msg.reply('<internal pony error>');
			}
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
	}
});

DBot.RegisterCommand({
	name: 'cstats',
	alias: ['channel', 'channelstats'],
	
	help_args: '',
	desc: 'Displays this server statistics collected by me',
	delay: 10,
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is a PM! x3';
		
		var server = msg.channel;
		var ID = DBot.GetChannelID(server);
		var UID = DBot.GetUserID(msg.author);
		
		// Generic Server Stats
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_channel` WHERE `UID` = ' + ID, function(err, data) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_channel` WHERE `UID` = ' + ID, function(err, data2) {
		MySQL.query('SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_channel` WHERE `UID` = ' + ID, function(err, data3) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_channel` WHERE `UID` = ' + ID, function(err, data4) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_channel` WHERE `UID` = ' + ID, function(err, data5) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_channel` WHERE `UID` = ' + ID, function(err, data6) {
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_channel` WHERE `UID` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1', function(err, data7) {
		
		// Server Stats by user
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__uchars_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID, function(err, data8) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__uwords_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID, function(err, data9) {
		MySQL.query('SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__uwords_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID, function(err, data10) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__uimages_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID, function(err, data11) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__uphrases_channel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID, function(err, data12) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_uchannel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID, function(err, data13) {
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_uchannel` WHERE `UID` = ' + UID + ' AND `CHANNEL` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1', function(err, data14) {
			try {
				data = data || {};
				data2 = data2 || {};
				data3 = data3 || {};
				data4 = data4 || {};
				data5 = data5 || {};
				data6 = data6 || {};
				data7 = data7 || {};
				data8 = data8 || {};
				data9 = data9 || {};
				data10 = data10 || {};
				data11 = data11 || {};
				data12 = data12 || {};
				data13 = data13 || {};
				data14 = data14 || {};
				
				var TotalChars = data[0] && data[0].cnt || 0;
				var TotalWordsSaid = data2[0] && data2[0].cnt || 0;
				var TotalUniqueWords = data3[0] && data3[0].cnt || 0;
				var TotalImagesSend = data4[0] && data4[0].cnt || 0;
				var TotalPhrasesSaid = data5[0] && data5[0].cnt || 0;
				var TotalCommandsExecuted = data6[0] && data6[0].cnt || 0;
				
				var MostUsedCommand = data7[0] && data7[0].COMMAND || '<unknown>';
				var MostUsedCommand_count = data7[0] && data7[0].summ || 0;
				
				var TotalChars_USR = data8[0] && data8[0].cnt || 0;
				var TotalWordsSaid_USR = data9[0] && data9[0].cnt || 0;
				var TotalUniqueWords_USR = data10[0] && data10[0].cnt || 0;
				var TotalImagesSend_USR = data11[0] && data11[0].cnt || 0;
				var TotalPhrasesSaid_USR = data12[0] && data12[0].cnt || 0;
				var TotalCommandsExecuted_USR = data13[0] && data13[0].cnt || 0;
				
				var MostUsedCommand_USR = data14[0] && data14[0].COMMAND || '<unknown>';
				var MostUsedCommand_count_USR = data14[0] && data14[0].summ || 0;
				
				var output = '\n```';
				
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
				
				output += 'Total chars printed by you:                   ' + numeral(TotalChars_USR).format('0,0') + '\n';
				output += 'Total words said by you:                      ' + numeral(TotalWordsSaid_USR).format('0,0') + '\n';
				output += 'Total unique words said by you:               ' + numeral(TotalUniqueWords_USR).format('0,0') + '\n';
				output += 'Total images sended by you:                   ' + numeral(TotalImagesSend_USR).format('0,0') + '\n';
				output += 'Total phrases said by you:                    ' + numeral(TotalPhrasesSaid_USR).format('0,0') + '\n';
				output += 'Total amount of commands executed by you:     ' + numeral(TotalCommandsExecuted_USR).format('0,0') + '\n';
				output += 'Most command used by you:                     ' + MostUsedCommand_USR + '; Times Executed: ' + numeral(MostUsedCommand_count_USR).format('0,0') + '\n';
				
				output += '```\nAlso try stats (global statistics) and cstats (channel statistics)';
				
				msg.reply(output);
			} catch(err) {
				console.error(err);
				msg.reply('<internal pony error>');
			}
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
	}
});

DBot.RegisterCommand({
	name: 'stats',
	
	help_args: '',
	desc: 'Displays generic statistics collected by me',
	delay: 10,
	
	func: function(args, cmd, rawcmd, msg) {
		var UserID = msg.author.id;
		var servers = 0;
		var channels = 0;
		var users = 0;
		var USERS_MEM = {};
		var ID = DBot.GetUserID(msg.author);
		
		var Servers = DBot.bot.guilds.array();
		
		for (var i in Servers) {
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
		
		// Global stats
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_client`', function(err, data) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_client`', function(err, data2) {
		MySQL.query('SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_client`', function(err, data3) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_client`', function(err, data4) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_client`', function(err, data5) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_client`', function(err, data6) {
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_client` GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1', function(err, data7) {
		// Global stats for user
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__chars_client` WHERE `UID` = ' + ID, function(err, data8) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__words_client` WHERE `UID` = ' + ID, function(err, data9) {
		MySQL.query('SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_client` WHERE `UID` = ' + ID, function(err, data10) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__images_client` WHERE `UID` = ' + ID, function(err, data11) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__phrases_client` WHERE `UID` = ' + ID, function(err, data12) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM `stats__command_client` WHERE `UID` = ' + ID, function(err, data13) {
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_client`  WHERE `UID` = ' + ID + ' GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1', function(err, data14) {
			try {
				data = data || {};
				data2 = data2 || {};
				data3 = data3 || {};
				data4 = data4 || {};
				data5 = data5 || {};
				data6 = data6 || {};
				data7 = data7 || {};
				data8 = data8 || {};
				data9 = data9 || {};
				data10 = data10 || {};
				data11 = data11 || {};
				data12 = data12 || {};
				data13 = data13 || {};
				data14 = data14 || {};
				
				var TotalChars = data[0] && data[0].cnt || 0;
				var TotalWordsSaid = data2[0] && data2[0].cnt || 0;
				var TotalUniqueWords = data3[0] && data3[0].cnt || 0;
				var TotalImagesSend = data4[0] && data4[0].cnt || 0;
				var TotalPhrasesSaid = data5[0] && data5[0].cnt || 0;
				var TotalCommandsExecuted = data6[0] && data6[0].cnt || 0;
				
				var MostUsedCommand = data7[0] && data7[0].COMMAND || '<unknown>';
				var MostUsedCommand_count = data7[0] && data7[0].summ || 0;
				
				var TotalChars_USER = data8[0] && data8[0].cnt || 0;
				var TotalWordsSaid_USER = data9[0] && data9[0].cnt || 0;
				var TotalUniqueWords_USER = data10[0] && data10[0].cnt || 0;
				var TotalImagesSend_USER = data11[0] && data11[0].cnt || 0;
				var TotalPhrasesSaid_USER = data12[0] && data12[0].cnt || 0;
				var TotalCommandsExecuted_USER = data13[0] && data13[0].cnt || 0;
				
				var MostUsedCommand_USER = data14[0] && data14[0].COMMAND || '<unknown>';
				var MostUsedCommand_count_USER = data14[0] && data14[0].summ || 0;
				
				var output = '\n```';
				
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
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
		});
	},
});

var utf8 = require('utf8');

DBot.RegisterCommand({
	name: 'top10',
	
	help_args: '[@mention]',
	desc: 'Displays TOP10 of talkable persons on this server\nTo get associated user-ID table, type as argument "1"\n**W.A.R.N.I.N.G**: Associated table can trigger **mention spam**!',
	delay: 10,
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Oh! This is PM x3';
		
		var ID = DBot.GetServerID(msg.channel.guild);
		var query = 'SELECT `user_id`.`UID` as `USERID`, `user_id`.`ID` as `ID`, `user_names`.`USERNAME` as `USERNAME`, `stats__uphrases_server`.`COUNT` as `COUNT` FROM `user_id`, `user_names`, `stats__uphrases_server` WHERE `stats__uphrases_server`.`UID` = `user_id`.`ID` AND `user_names`.`ID` = `user_id`.`ID` AND `stats__uphrases_server`.`USERVER` = ' + ID + ' ORDER BY `COUNT` DESC LIMIT 0, 10';
		
		MySQL.query(query, function(err, data) {
			try {
				var total = 0;
				var words = {};
				var uwords = {};
				
				var continueFunc = function() {
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
				
				for (var i in data) {
					total++;
					
					(function() {
						var newI = Number(i);
						
						MySQL.query('SELECT SUM(`stats__uwords_server`.`COUNT`) as `RESULT` FROM `stats__uwords_server` WHERE `stats__uwords_server`.`UID` = ' + data[newI].ID + ' AND `stats__uwords_server`.`USERVER` = ' + ID, function(err, newData) {
							MySQL.query('SELECT COUNT(DISTINCT `stats__uwords_server`.`WORD`) as `RESULT` FROM `stats__uwords_server` WHERE `stats__uwords_server`.`UID` = ' + data[newI].ID + ' AND `stats__uwords_server`.`USERVER` = ' + ID, function(err, newData2) {
								total--;
								words[data[newI].ID] = newData[0].RESULT || 'WTF';
								uwords[data[newI].ID] = newData2[0].RESULT;
								
								if (total == 0) {
									try {
										continueFunc();
									} catch(err) {
										console.error(err);
										msg.reply('<internal pony error>');
									}
								}
							});
						});
					})();
				}
			} catch(err) {
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
	
	help_args: '',
	desc: 'Displays global command usage statistics',
	delay: 10,
	
	func: function(args, cmd, rawcmd, msg) {
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_client` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data) {
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_client` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(msg.author) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
	},
});

DBot.RegisterCommand({
	name: 'scommandstats',
	alias: ['scommstats'],
	
	help_args: '',
	desc: 'Displays this server command usage statistics',
	delay: 10,
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_server` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetServerID(msg.channel.guild) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data) {
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_userver` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(msg.author) + '" AND `USERVER` = "' + DBot.GetServerID(msg.channel.guild) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
	},
});

DBot.RegisterCommand({
	name: 'ccommandstats',
	alias: ['ccommstats'],
	
	help_args: '',
	desc: 'Displays this channel command usage statistics',
	delay: 10,
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_channel` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetChannelID(msg.channel) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data) {
			MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `CALLED_TIMES` FROM `stats__command_uchannel` WHERE `COMMAND` != "more" AND `COMMAND` != "retry" AND `UID` = "' + DBot.GetUserID(msg.author) + '" AND `CHANNEL` = "' + DBot.GetChannelID(msg.channel) + '" GROUP BY `COMMAND` ORDER BY `CALLED_TIMES` DESC LIMIT 0, 10', function(err, data2) {
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
	},
});
