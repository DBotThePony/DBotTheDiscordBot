
// Total words said
DBot.DefineMySQLTable('stats__words_client', 'UID INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD)');
DBot.DefineMySQLTable('stats__words_channel', 'UID INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD)');
DBot.DefineMySQLTable('stats__words_server', 'UID INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD)');

// Total Phrases said
DBot.DefineMySQLTable('stats__phrases_client', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__phrases_channel', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');
DBot.DefineMySQLTable('stats__phrases_server', 'UID INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID)');

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

// Total words said on servers by users
DBot.DefineMySQLTable('stats__uwords_channel', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD, CHANNEL)');
DBot.DefineMySQLTable('stats__uwords_server', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, WORD VARCHAR(64) NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, WORD, USERVER)');

// Total phrases said on servers by users
DBot.DefineMySQLTable('stats__uphrases_channel', 'UID INTEGER NOT NULL, CHANNEL INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, CHANNEL)');
DBot.DefineMySQLTable('stats__uphrases_server', 'UID INTEGER NOT NULL, USERVER INTEGER NOT NULL, COUNT INTEGER NOT NULL, PRIMARY KEY (UID, USERVER)');

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
