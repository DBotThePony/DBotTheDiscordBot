
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

DBot.RegisterCommand({
	name: 'sstats',
	alias: ['server', 'serverstats'],
	
	help_args: '',
	desc: 'Displays this server statistics collected by me',
	delay: 5,
	
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
				
				output += 'Total Channels on this server: ' + channels + '\n';
				output += 'Total Users on this server: ' + users + '\n';
				output += 'Total chars printed by all users: ' + TotalChars + '\n';
				output += 'Total words said by all users: ' + TotalWordsSaid + '\n';
				output += 'Total unique words: ' + TotalUniqueWords + '\n';
				output += 'Total images sended: ' + TotalImagesSend + '\n';
				output += 'Total phrases said by all users: ' + TotalPhrasesSaid + '\n';
				output += 'Total amount of commands executed: ' + TotalCommandsExecuted + '\n';
				output += 'Most command used: ' + MostUsedCommand + '; Times Executed: ' + MostUsedCommand_count + '\n';
				
				output += '------ Your stats on this server\n';
				
				output += 'Total chars printed by you: ' + TotalChars_USR + '\n';
				output += 'Total words said by you: ' + TotalWordsSaid_USR + '\n';
				output += 'Total unique words said by you: ' + TotalUniqueWords_USR + '\n';
				output += 'Total images sended by you: ' + TotalImagesSend_USR + '\n';
				output += 'Total phrases said by you: ' + TotalPhrasesSaid_USR + '\n';
				output += 'Total amount of commands executed by you: ' + TotalCommandsExecuted_USR + '\n';
				output += 'Most command used by you: ' + MostUsedCommand_USR + '; Times Executed: ' + MostUsedCommand_count_USR + '\n';
				
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
	delay: 5,
	
	func: function(args, cmd, rawcmd, msg) {
		var UserID = msg.author.id;
		var servers = 0;
		var channels = 0;
		var users = 0;
		var USERS_MEM = {};
		
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
		
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM stats__chars_client', function(err, data) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM stats__words_client', function(err, data2) {
		MySQL.query('SELECT COUNT(DISTINCT `WORD`) as `cnt` FROM `stats__words_client`', function(err, data3) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM stats__images_client', function(err, data4) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM stats__phrases_client', function(err, data5) {
		MySQL.query('SELECT SUM(`COUNT`) as `cnt` FROM stats__command_client', function(err, data6) {
		MySQL.query('SELECT `COMMAND`, SUM(`COUNT`) as `summ` FROM `stats__command_client` GROUP BY `COMMAND` ORDER BY `summ` DESC LIMIT 0, 1', function(err, data7) {
			var TotalChars = data[0].cnt || 0;
			var TotalWordsSaid = data2[0].cnt || 0;
			var TotalUniqueWords = data3[0].cnt || 0;
			var TotalImagesSend = data4[0].cnt || 0;
			var TotalPhrasesSaid = data5[0].cnt || 0;
			var TotalCommandsExecuted = data6[0].cnt || 0;
			
			var MostUsedCommand = data7[0].COMMAND || '<unknown>';
			var MostUsedCommand_count = data7[0].summ || 0;
			
			var output = '\n';
			
			output += 'Total Servers: ' + servers + '\n';
			output += 'Total Channels: ' + channels + '\n';
			output += 'Total Users: ' + users + '\n';
			output += 'Total chars printed by all users: ' + TotalChars + '\n';
			output += 'Total words said by all users: ' + TotalWordsSaid + '\n';
			output += 'Total unique words: ' + TotalUniqueWords + '\n';
			output += 'Total images sended: ' + TotalImagesSend + '\n';
			output += 'Total phrases said by all users: ' + TotalPhrasesSaid + '\n';
			output += 'Total amount of commands executed: ' + TotalCommandsExecuted + '\n';
			output += 'Most command used: ' + MostUsedCommand + '; Times Executed: ' + MostUsedCommand_count + '\n';
			output += 'Also try sstats (server statistics) and cstats (channel statistics)';
			
			msg.reply(output);
		});
		});
		});
		});
		});
		});
		});
	},
});


