
const utf8 = require('utf8');

MySQL.query('CREATE TABLE IF NOT EXISTS `votes_list` (\
	`ID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,\
	`SERVER` INTEGER NOT NULL,\
	`CHANNEL` INTEGER,\
	`NAME` VARCHAR(64) NOT NULL,\
	`STAMP` INTEGER NOT NULL,\
	`CLOSED` BOOLEAN NOT NULL DEFAULT false\
)');

MySQL.query('CREATE TABLE IF NOT EXISTS `votes_text` (\
	`ID` INTEGER NOT NULL PRIMARY KEY,\
	`TEXT` TEXT NOT NULL\
)');

MySQL.query('CREATE TABLE IF NOT EXISTS `votes_votes` (\
	`VOTE` INTEGER NOT NULL,\
	`USER` INTEGER NOT NULL,\
	`CHOICE` INTEGER NOT NULL,\
	PRIMARY KEY (`VOTE`, `USER`)\
)');

MySQL.query('CREATE TABLE IF NOT EXISTS `votes_choices` (\
	`VOTE` INTEGER NOT NULL,\
	`CHOICEID` INTEGER NOT NULL,\
	`NAME` VARCHAR(64) NOT NULL,\
	`VOTES` INTEGER NOT NULL DEFAULT 0,\
	PRIMARY KEY (`VOTE`, `CHOICEID`)\
)');

DBot.RegisterCommand({
	name: 'createvote',
	
	help_args: '<name> <choices>',
	desc: 'Creates a vote',
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS'))
			return 'You must have `MANAGE_CHANNELS` rights ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['createvote'], 2, args);
		
		if (!args[1])
			return 'At least two choices is required' + Util.HighlightHelp(['createvote'], 3, args);
		
		if (!args[2])
			return 'At least two choices is required' + Util.HighlightHelp(['createvote'], 4, args);
		
		if (args[0].length > 60) {
			return 'Too long title';
		}
		
		for (let i = 1; i < args.length; i++) {
			if (args[i].length > 60) {
				return 'Too long choice';
			}
		}
		
		MySQL.query('INSERT INTO `votes_list` (`SERVER`, `NAME`, `STAMP`) VALUES (' + DBot.GetServerID(msg.channel.guild) + ', ' + MySQL.escape(utf8.encode(args[0])) + ', ' + CurTime() + ')', function(err, data) {
			if (err) {
				msg.reply('Internal pony error');
				return;
			}
			
			var uid = data.insertId;
			
			for (let i = 1; i < args.length; i++) {
				MySQL.query('INSERT INTO `votes_choices` (`VOTE`, `CHOICEID`, `NAME`) VALUES (' + uid + ', ' + i + ', ' + Util.escape(args[i]) + ')');
			}
			
			msg.reply('Vote created! Vote ID: #' + uid);
		});
	}
});

var Bar = function(perc, votes) {
	var output = '[';
	perc = perc * 100;
	
	for (let i = 0; i < perc / 4; i++) {
		output += '|';
	}
	
	for (let i = perc / 4 + 1; i <= 25; i++) {
		output += ' ';
	}
	
	output += '] ' + Util.AppendSpaces(Math.floor(perc).toString() + '%', 5) + '(' + votes + ' votes)';
	
	return output;
}

DBot.RegisterCommand({
	name: 'voteinfo',
	
	help_args: '<name or ID>',
	desc: 'Prints Infos about vote. You Can enter vote ID or vote name',
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['voteinfo'], 2, args);
		
		var voteID = Util.ToNumber(args[0]);
		
		if (voteID) {
			MySQL.query('SELECT * FROM `votes_list` WHERE `ID` = ' + voteID + ' AND `SERVER` = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				var voteData = data[0];
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with ID: ' + voteID);
					return;
				}
				
				if (data[0].CHANNEL && data[0].CHANNEL != DBot.GetChannelID(msg.channel)) {
					msg.reply('No such a vote with ID: ' + voteID);
					return;
				}
				
				MySQL.query('SELECT `CHOICEID`, `NAME`, `VOTES` FROM `votes_choices` WHERE `VOTE` = ' + voteID, function(err, data) {
					var output = '```Vote name: ' + voteData.NAME + '\n';
					var total = 0;
					
					for (let i in data) {
						total += Number(data[i].VOTES);
					}
					
					for (let i in data) {
						let row = data[i];
						
						if (total == 0) {
							output += '\n #' + Util.AppendSpaces(row.CHOICEID, 3) + ' - ' + Util.AppendSpaces(row.NAME, 20) + ' - ' + Bar(0, 0);
						} else {
							output += '\n #' + Util.AppendSpaces(row.CHOICEID, 3) + ' - ' + Util.AppendSpaces(row.NAME, 20) + ' - ' + Bar(row.VOTES / total, row.VOTES);
						}
					}
					
					if (voteData.CLOSES) {
						output += '\n Vote is closed';
					} else {
						output += '\n Vote is open!';
					}
					
					output +=  '```';
					msg.reply(output);
				});
			});
		} else {
			MySQL.query('SELECT * FROM `votes_list` WHERE `NAME` LIKE ' + Util.escape('%' + cmd + '%') + ' AND `SERVER` = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with name: ' + cmd);
					return;
				}
				
				if (data[0].CHANNEL && data[0].CHANNEL != DBot.GetChannelID(msg.channel)) {
					msg.reply('No such a vote with name: ' + cmd);
					return;
				}
				
				var voteID = data[0].ID;
				var voteData = data[0];
				
				MySQL.query('SELECT `CHOICEID`, `NAME`, `VOTES` FROM `votes_choices` WHERE `VOTE` = ' + voteID, function(err, data) {
					var output = '```Vote name: ' + voteData.NAME + '\n';
					var total = 0;
					
					for (let i in data) {
						total += Number(data[i].VOTES);
					}
					
					for (let i in data) {
						let row = data[i];
						
						if (total == 0) {
							output += '\n #' + Util.AppendSpaces(row.CHOICEID, 3) + ' - ' + Util.AppendSpaces(row.NAME, 20) + ' - ' + Bar(0, 0);
						} else {
							output += '\n #' + Util.AppendSpaces(row.CHOICEID, 3) + ' - ' + Util.AppendSpaces(row.NAME, 20) + ' - ' + Bar(row.VOTES / total, row.VOTES);
						}
					}
					
					if (voteData.CLOSES) {
						output += '\n Vote is closed';
					} else {
						output += '\n Vote is open!';
					}
					
					output +=  '```';
					msg.reply(output);
				});
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'vote',
	
	help_args: '<name or ID> <vote for what by name or ID>',
	desc: 'Vote!',
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['vote'], 2, args);
		
		if (!args[1])
			return 'Name of choice is required' + Util.HighlightHelp(['vote'], 3, args);
		
		var voteID = Util.ToNumber(args[0]);
		var userID = DBot.GetUserID(msg.author);
		
		var voteCMD = args[1];
		
		for (let i = 2; i < args.length; i++) {
			voteCMD += ' ' + args[i];
		}
		
		if (voteID) {
			MySQL.query('SELECT * FROM `votes_list` WHERE `ID` = ' + voteID + ' AND `SERVER` = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with ID: ' + voteID);
					return;
				}
				
				if (data[0].CHANNEL && data[0].CHANNEL != DBot.GetChannelID(msg.channel)) {
					msg.reply('No such a vote with ID: ' + voteID);
					return;
				}
				
				var voteData = data[0];
				
				MySQL.query('SELECT `CHOICE` FROM `votes_votes` WHERE `VOTE` = ' + voteID, function(err, data) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					if (data && data[0]) {
						MySQL.query('SELECT `NAME` FROM `votes_choices` WHERE `VOTE` = ' + voteID + ' AND `CHOICEID` = ' + data[0].CHOICE, function(err, data) {
							msg.reply('You are already voted for ' + data[0].NAME + ' in ' + voteData.NAME + '!');
						});
						
						return;
					}
					
					var choiceID = Util.ToNumber(args[1]);
					
					if (choiceID) {
						MySQL.query('SELECT `NAME` FROM `votes_choices` WHERE `VOTE` = ' + voteID + ' AND `CHOICEID` = ' + choiceID, function(err, data) {
							if (err) {
								msg.reply('Internal pony error');
								return;
							}
							
							if (!data || !data[0]) {
								msg.reply('No such choice with ID: ' + choiceID);
								return;
							}
							
							MySQL.query('INSERT INTO `votes_votes` VALUE (' + voteID + ', ' + userID + ', ' + choiceID + ')', function(err) {
								if (err) {
									msg.reply('Internal pony error');
									return;
								}
								
								MySQL.query('UPDATE `votes_choices` SET `VOTES` = `VOTES` + 1 WHERE `VOTE` = ' + voteID + ' AND `CHOICEID` = ' + choiceID, function(err) {
									if (err) {
										msg.reply('Internal pony error');
										return;
									}
									
									msg.reply('You voted for ' + data[0].NAME + ' in ' + voteData.NAME + '!');
								});
							});
						});
					} else {
						MySQL.query('SELECT `CHOICEID`, `NAME` FROM `votes_choices` WHERE `VOTE` = ' + voteID + ' AND `NAME` LIKE ' + Util.escape('%' + voteCMD + '%'), function(err, data) {
							if (err) {
								msg.reply('Internal pony error');
								return;
							}
							
							if (!data || !data[0]) {
								msg.reply('No such choice named: ' + voteCMD);
								return;
							}
							
							var choiceID = data[0].CHOICEID;
							
							MySQL.query('INSERT INTO `votes_votes` VALUE (' + voteID + ', ' + userID + ', ' + choiceID + ')', function(err) {
								if (err) {
									msg.reply('Internal pony error');
									return;
								}
								
								MySQL.query('UPDATE `votes_choices` SET `VOTES` = `VOTES` + 1 WHERE `VOTE` = ' + voteID + ' AND `CHOICEID` = ' + choiceID, function(err) {
									if (err) {
										msg.reply('Internal pony error');
										return;
									}
									
									msg.reply('You voted for ' + data[0].NAME + ' in ' + voteData.NAME + '!');
								});
							});
						});
					}
				});
			});
		} else {
			MySQL.query('SELECT * FROM `votes_list` WHERE `NAME` LIKE ' + Util.escape('%' + args[0] + '%') + ' AND `SERVER` = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote named: ' + args[0]);
					return;
				}
				
				if (data[0].CHANNEL && data[0].CHANNEL != DBot.GetChannelID(msg.channel)) {
					msg.reply('No such a vote named: ' + args[0]);
					return;
				}
				
				var voteID = data[0].ID;
				var voteData = data[0];
				
				MySQL.query('SELECT `CHOICE` FROM `votes_votes` WHERE `VOTE` = ' + voteID, function(err, data) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					if (data && data[0]) {
						MySQL.query('SELECT `NAME` FROM `votes_choices` WHERE `VOTE` = ' + voteID + ' AND `CHOICEID` = ' + data[0].CHOICE, function(err, data) {
							msg.reply('You are already voted for ' + data[0].NAME + ' in ' + voteData.NAME + '!');
						});
						
						return;
					}
					
					var choiceID = Util.ToNumber(args[1]);
					
					if (choiceID) {
						MySQL.query('SELECT `NAME` FROM `votes_choices` WHERE `VOTE` = ' + voteID + ' AND `CHOICEID` = ' + choiceID, function(err, data) {
							if (err) {
								msg.reply('Internal pony error');
								return;
							}
							
							if (!data || !data[0]) {
								msg.reply('No such choice with ID: ' + choiceID);
								return;
							}
							
							MySQL.query('INSERT INTO `votes_votes` VALUE (' + voteID + ', ' + userID + ', ' + choiceID + ')', function(err) {
								if (err) {
									msg.reply('Internal pony error');
									return;
								}
								
								MySQL.query('UPDATE `votes_choices` SET `VOTES` = `VOTES` + 1 WHERE `VOTE` = ' + voteID + ' AND `CHOICEID` = ' + choiceID, function(err) {
									if (err) {
										msg.reply('Internal pony error');
										return;
									}
									
									msg.reply('You voted for ' + data[0].NAME + ' in ' + voteData.NAME + '!');
								});
							});
						});
					} else {
						MySQL.query('SELECT `CHOICEID`, `NAME` FROM `votes_choices` WHERE `VOTE` = ' + voteID + ' AND `NAME` LIKE ' + Util.escape('%' + voteCMD + '%'), function(err, data) {
							if (err) {
								msg.reply('Internal pony error');
								return;
							}
							
							if (!data || !data[0]) {
								msg.reply('No such choice named: ' + voteCMD);
								return;
							}
							
							var choiceID = data[0].CHOICEID;
							
							MySQL.query('INSERT INTO `votes_votes` VALUE (' + voteID + ', ' + userID + ', ' + choiceID + ')', function(err) {
								if (err) {
									msg.reply('Internal pony error');
									return;
								}
								
								MySQL.query('UPDATE `votes_choices` SET `VOTES` = `VOTES` + 1 WHERE `VOTE` = ' + voteID + ' AND `CHOICEID` = ' + choiceID, function(err) {
									if (err) {
										msg.reply('Internal pony error');
										return;
									}
									
									msg.reply('You voted for ' + data[0].NAME + ' in ' + voteData.NAME + '!');
								});
							});
						});
					}
				});
			});
		}
	}
});

