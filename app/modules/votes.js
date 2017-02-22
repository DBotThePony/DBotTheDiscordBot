
/* global DBot, Util */

const utf8 = require('utf8');

DBot.RegisterCommand({
	name: 'createvote',
	
	help_args: '<name> <choices>',
	desc: 'Creates a vote',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS'))
			return 'You must have "MANAGE_CHANNELS" rights ;n;';
		
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
		
		Postgres.query('INSERT INTO votes_list ("SERVER", "NAME", "STAMP") VALUES (' + DBot.GetServerID(msg.channel.guild) + ', ' + Postgres.escape(utf8.encode(args[0])) + ', ' + CurTime() + ') RETURNING "ID"', function(err, data) {
			if (err) {
				msg.reply('Internal pony error');
				return;
			}
			
			let uid = data[0].ID;
			
			for (let i = 1; i < args.length; i++) {
				Postgres.query('INSERT INTO votes_choices ("VOTE", "CHOICEID", "NAME") VALUES (' + uid + ', ' + i + ', ' + Postgres.escape(args[i]) + ')');
			}
			
			msg.reply('Vote created! Vote ID: #' + uid);
		});
	}
});

DBot.RegisterCommand({
	name: 'votetext',
	alias: ['addtexttovote', 'textvote', 'describevote'],
	
	help_args: '<name or ID of vote> <text> ...',
	desc: 'Sets vote\'s description',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS'))
			return 'You must have "MANAGE_CHANNELS" rights ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['votetext'], 2, args);
		
		let voteID = Number.from(args[0]);
		
		let newCMD = args[1];
		
		for (let i = 2; i < args.length; i++) {
			newCMD += ' ' + args[i];
		}
		
		if (voteID) {
			Postgres.query('SELECT * FROM votes_list WHERE "ID" = ' + voteID + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
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
				
				let voteData = data[0];
				
				Postgres.query('INSERT INTO votes_text VALUES (' + voteID + ', ' + Postgres.escape(newCMD) + ') ON CONFLICT ("ID") DO UPDATE SET "TEXT" = ' + Postgres.escape(newCMD), function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Vote description was set!');
				});
			});
		} else {
			Postgres.query('SELECT * FROM votes_list WHERE "NAME" LIKE ' + Postgres.escape('%' + args[0] + '%') + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with name: ' + args[0]);
					return;
				}
				
				if (data[0].CHANNEL && data[0].CHANNEL != DBot.GetChannelID(msg.channel)) {
					msg.reply('No such a vote with name: ' + args[0]);
					return;
				}
				
				let voteID = data[0].ID;
				let voteData = data[0];
				
				Postgres.query('INSERT INTO votes_text VALUES (' + voteID + ', ' + Postgres.escape(newCMD) + ') ON CONFLICT ("ID") DO UPDATE SET "TEXT" = ' + Postgres.escape(newCMD), function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Vote description was set!');
				});
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'closevote',
	
	help_args: '<name or ID of vote>',
	desc: 'Closes a vote',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS'))
			return 'You must have "MANAGE_CHANNELS" rights ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['votetext'], 2, args);
		
		let voteID = Number.from(cmd);
		
		if (voteID) {
			Postgres.query('SELECT * FROM votes_list WHERE "ID" = ' + voteID + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
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
				
				if (data[0].CLOSED) {
					msg.reply('Vote is already closed: ' + voteID);
					return;
				}
				
				let voteData = data[0];
				
				Postgres.query('UPDATE votes_list SET "CLOSED" = true WHERE "ID" = ' + voteID, function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Vote was closed!');
				});
			});
		} else {
			Postgres.query('SELECT * FROM votes_list WHERE "NAME" LIKE ' + Postgres.escape('%' + args[0] + '%') + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with name: ' + args[0]);
					return;
				}
				
				if (data[0].CHANNEL && data[0].CHANNEL != DBot.GetChannelID(msg.channel)) {
					msg.reply('No such a vote with name: ' + args[0]);
					return;
				}
				
				if (data[0].CLOSED) {
					msg.reply('Vote is already closed: ' + args[0]);
					return;
				}
				
				let voteID = data[0].ID;
				let voteData = data[0];
				
				Postgres.query('UPDATE votes_list SET "CLOSED" = true WHERE "ID" = ' + voteID, function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Vote was closed!');
				});
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'reopenvote',
	
	help_args: '<name or ID of vote>',
	desc: 'Reopens a vote',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS'))
			return 'You must have "MANAGE_CHANNELS" rights ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['votetext'], 2, args);
		
		let voteID = Number.from(cmd);
		
		if (voteID) {
			Postgres.query('SELECT * FROM votes_list WHERE "ID" = ' + voteID + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
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
				
				if (!data[0].CLOSED) {
					msg.reply('Vote is not closed: ' + voteID);
					return;
				}
				
				let voteData = data[0];
				
				Postgres.query('UPDATE votes_list SET "CLOSED" = false WHERE "ID" = ' + voteID, function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Vote was reopened!');
				});
			});
		} else {
			Postgres.query('SELECT * FROM votes_list WHERE "NAME" LIKE ' + Postgres.escape('%' + args[0] + '%') + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with name: ' + args[0]);
					return;
				}
				
				if (data[0].CHANNEL && data[0].CHANNEL != DBot.GetChannelID(msg.channel)) {
					msg.reply('No such a vote with name: ' + args[0]);
					return;
				}
				
				if (!data[0].CLOSED) {
					msg.reply('Vote is not closed: ' + args[0]);
					return;
				}
				
				let voteID = data[0].ID;
				let voteData = data[0];
				
				Postgres.query('UPDATE votes_list SET "CLOSED" = false WHERE "ID" = ' + voteID, function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Vote was reopened!');
				});
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'setvotechannel',
	alias: ['votechannel', 'bindvote'],
	
	help_args: '<name or ID of vote>',
	desc: 'Binds a vote to current channel. Useful for making private votes.',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS'))
			return 'You must have "MANAGE_CHANNELS" rights ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['votetext'], 2, args);
		
		let voteID = Number.from(cmd);
		
		if (voteID) {
			Postgres.query('SELECT * FROM votes_list WHERE "ID" = ' + voteID + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with ID: ' + voteID);
					return;
				}
				
				let voteData = data[0];
				
				Postgres.query('UPDATE votes_list SET "CHANNEL" = ' + DBot.GetChannelID(msg.channel) + ' WHERE "ID" = ' + voteID, function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Channel was set!');
				});
			});
		} else {
			Postgres.query('SELECT * FROM votes_list WHERE "NAME" LIKE ' + Postgres.escape('%' + args[0] + '%') + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with name: ' + args[0]);
					return;
				}
				
				let voteID = data[0].ID;
				let voteData = data[0];
				
				Postgres.query('UPDATE votes_list SET "CHANNEL" = ' + DBot.GetChannelID(msg.channel) + ' WHERE "ID" = ' + voteID, function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Channel was set!');
				});
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'unsetvotechannel',
	alias: ['voteunchannel', 'unbindvote'],
	
	help_args: '<name or ID of vote>',
	desc: 'Unbinds a vote from any channel',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!msg.member.hasPermission('MANAGE_CHANNELS'))
			return 'You must have "MANAGE_CHANNELS" rights ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['votetext'], 2, args);
		
		let voteID = Number.from(cmd);
		
		if (voteID) {
			Postgres.query('SELECT * FROM votes_list WHERE "ID" = ' + voteID + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with ID: ' + voteID);
					return;
				}
				
				let voteData = data[0];
				
				Postgres.query('UPDATE votes_list SET "CHANNEL" = NULL WHERE "ID" = ' + voteID, function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Channel was unset!');
				});
			});
		} else {
			Postgres.query('SELECT * FROM votes_list WHERE "NAME" LIKE ' + Postgres.escape('%' + args[0] + '%') + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
				if (err) {
					msg.reply('Internal pony error');
					return;
				}
				
				if (!data || !data[0]) {
					msg.reply('No such a vote with name: ' + args[0]);
					return;
				}
				
				let voteID = data[0].ID;
				let voteData = data[0];
				
				Postgres.query('UPDATE votes_list SET "CHANNEL" = NULL WHERE "ID" = ' + voteID, function(err) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					msg.reply('Channel was unset!');
				});
			});
		}
	}
});

let Bar = function(perc, votes) {
	let output = '[';
	perc = perc * 100;
	
	for (let i = 0; i < perc / 4; i++) {
		output += '|';
	}
	
	for (let i = perc / 4 + 1; i <= 25; i++) {
		output += ' ';
	}
	
	output += '] ' + String.appendSpaces(Math.floor(perc).toString() + '%', 5) + '(' + votes + ' votes)';
	
	return output;
}

DBot.RegisterCommand({
	name: 'voteinfo',
	
	help_args: '<name or ID>',
	desc: 'Prints Infos about vote. You Can enter vote ID or vote name',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['voteinfo'], 2, args);
		
		let voteID = Number.from(args[0]);
		
		if (voteID) {
			Postgres.query('SELECT * FROM votes_list WHERE "ID" = ' + voteID + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
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
				
				let voteData = data[0];
				
				Postgres.query('SELECT "CHOICEID", "NAME", "VOTES" FROM votes_choices WHERE "VOTE" = ' + voteID, function(err, data) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					Postgres.query('SELECT "TEXT" FROM votes_text WHERE "ID" = ' + voteID, function(err, textData) {
						if (err) {
							msg.reply('Internal pony error');
							return;
						}
						
						let output = '```Vote name: ' + voteData.NAME + '\n';
						let total = 0;
						
						for (let row of data) {
							total += Number(row.VOTES);
						}
						
						for (let row of data) {
							if (total == 0) {
								output += '\n #' + String.appendSpaces(row.CHOICEID, 3) + ' - ' + String.appendSpaces(utf8.decode(row.NAME), 20) + ' - ' + Bar(0, 0);
							} else {
								output += '\n #' + String.appendSpaces(row.CHOICEID, 3) + ' - ' + String.appendSpaces(utf8.decode(row.NAME), 20) + ' - ' + Bar(row.VOTES / total, row.VOTES);
							}
						}
						
						if (voteData.CLOSED) {
							output += '\n Vote is closed';
						} else {
							output += '\n Vote is open!';
						}
						
						output += '```';
						
						if (textData && textData[0]) {
							output += '\nDescription: \n' + utf8.decode(textData[0].TEXT);
						}
						
						msg.reply(output);
					});
				});
			});
		} else {
			Postgres.query('SELECT * FROM votes_list WHERE "NAME" LIKE ' + Postgres.escape('%' + cmd + '%') + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
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
				
				let voteID = data[0].ID;
				let voteData = data[0];
				
				Postgres.query('SELECT "CHOICEID", "NAME", "VOTES" FROM votes_choices WHERE "VOTE" = ' + voteID, function(err, data) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					Postgres.query('SELECT "TEXT" FROM votes_text WHERE "ID" = ' + voteID, function(err, textData) {
						if (err) {
							msg.reply('Internal pony error');
							return;
						}
						
						let output = '```Vote name: ' + voteData.NAME + '\n';
						let total = 0;
						
						for (let row of data) {
							total += Number(row.VOTES);
						}
						
						for (let row of data) {
							if (total == 0) {
								output += '\n #' + String.appendSpaces(row.CHOICEID, 3) + ' - ' + String.appendSpaces(utf8.decode(row.NAME), 20) + ' - ' + Bar(0, 0);
							} else {
								output += '\n #' + String.appendSpaces(row.CHOICEID, 3) + ' - ' + String.appendSpaces(utf8.decode(row.NAME), 20) + ' - ' + Bar(row.VOTES / total, row.VOTES);
							}
						}
						
						if (voteData.CLOSED) {
							output += '\n Vote is closed';
						} else {
							output += '\n Vote is open!';
						}
						
						output += '```';
						
						if (textData && textData[0]) {
							output += '\nDescription: \n' + utf8.decode(textData[0].TEXT);
						}
						
						msg.reply(output);
					});
				});
			});
		}
	}
});

DBot.RegisterCommand({
	name: 'vote',
	
	help_args: '<name or ID> <vote for what by name or ID>',
	desc: 'Vote!',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;';
		
		if (!args[0])
			return 'Name of vote is required' + Util.HighlightHelp(['vote'], 2, args);
		
		if (!args[1])
			return 'Name of choice is required' + Util.HighlightHelp(['vote'], 3, args);
		
		let voteID = Number.from(args[0]);
		let userID = DBot.GetUserID(msg.author);
		
		let voteCMD = args[1];
		
		for (let i = 2; i < args.length; i++) {
			voteCMD += ' ' + args[i];
		}
		
		if (voteID) {
			Postgres.query('SELECT * FROM votes_list WHERE "ID" = ' + voteID + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
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
				
				if (data[0].CLOSED) {
					msg.reply('This vote is closed! #' + voteID);
					return;
				}
				
				let voteData = data[0];
				
				Postgres.query('SELECT "CHOICE" FROM votes_votes WHERE "VOTE" = ' + voteID, function(err, data) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					if (data && data[0]) {
						Postgres.query('SELECT "NAME" FROM votes_choices WHERE "VOTE" = ' + voteID + ' AND "CHOICEID" = ' + data[0].CHOICE, function(err, data) {
							msg.reply('You are already voted for ' + utf8.decode(data[0].NAME) + ' in ' + utf8.decode(voteData.NAME) + '!');
						});
						
						return;
					}
					
					let choiceID = Number.from(args[1]);
					
					if (choiceID) {
						Postgres.query('SELECT "NAME" FROM votes_choices WHERE "VOTE" = ' + voteID + ' AND "CHOICEID" = ' + choiceID, function(err, data) {
							if (err) {
								msg.reply('Internal pony error');
								return;
							}
							
							if (!data || !data[0]) {
								msg.reply('No such choice with ID: ' + choiceID);
								return;
							}
							
							Postgres.query('INSERT INTO votes_votes VALUE (' + voteID + ', ' + userID + ', ' + choiceID + ')', function(err) {
								if (err) {
									msg.reply('Internal pony error');
									return;
								}
								
								Postgres.query('UPDATE votes_choices SET "VOTES" = "VOTES" + 1 WHERE "VOTE" = ' + voteID + ' AND "CHOICEID" = ' + choiceID, function(err) {
									if (err) {
										msg.reply('Internal pony error');
										return;
									}
									
									msg.reply('You voted for ' + utf8.decode(data[0].NAME) + ' in ' + utf8.decode(voteData.NAME) + '!');
								});
							});
						});
					} else {
						Postgres.query('SELECT "CHOICEID", "NAME" FROM votes_choices WHERE "VOTE" = ' + voteID + ' AND "NAME" LIKE ' + Postgres.escape('%' + voteCMD + '%'), function(err, data) {
							if (err) {
								msg.reply('Internal pony error');
								return;
							}
							
							if (!data || !data[0]) {
								msg.reply('No such choice named: ' + voteCMD);
								return;
							}
							
							let choiceID = data[0].CHOICEID;
							
							Postgres.query('INSERT INTO votes_votes VALUE (' + voteID + ', ' + userID + ', ' + choiceID + ')', function(err) {
								if (err) {
									msg.reply('Internal pony error');
									return;
								}
								
								Postgres.query('UPDATE votes_choices SET "VOTES" = "VOTES" + 1 WHERE "VOTE" = ' + voteID + ' AND "CHOICEID" = ' + choiceID, function(err) {
									if (err) {
										msg.reply('Internal pony error');
										return;
									}
									
									msg.reply('You voted for ' + utf8.decode(data[0].NAME) + ' in ' + utf8.decode(voteData.NAME) + '!');
								});
							});
						});
					}
				});
			});
		} else {
			Postgres.query('SELECT * FROM votes_list WHERE "NAME" LIKE ' + Postgres.escape('%' + args[0] + '%') + ' AND "SERVER" = ' + DBot.GetServerID(msg.channel.guild), function(err, data) {
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
				
				if (data[0].CLOSED) {
					msg.reply('This vote is closed! ' + args[0]);
					return;
				}
				
				let voteID = data[0].ID;
				let voteData = data[0];
				
				Postgres.query('SELECT "CHOICE" FROM votes_votes WHERE "VOTE" = ' + voteID, function(err, data) {
					if (err) {
						msg.reply('Internal pony error');
						return;
					}
					
					if (data && data[0]) {
						Postgres.query('SELECT "NAME" FROM votes_choices WHERE "VOTE" = ' + voteID + ' AND "CHOICEID" = ' + data[0].CHOICE, function(err, data) {
							msg.reply('You are already voted for ' + utf8.decode(data[0].NAME) + ' in ' + utf8.decode(voteData.NAME) + '!');
						});
						
						return;
					}
					
					let choiceID = Number.from(args[1]);
					
					if (choiceID) {
						Postgres.query('SELECT "NAME" FROM votes_choices WHERE "VOTE" = ' + voteID + ' AND "CHOICEID" = ' + choiceID, function(err, data) {
							if (err) {
								msg.reply('Internal pony error');
								return;
							}
							
							if (!data || !data[0]) {
								msg.reply('No such choice with ID: ' + choiceID);
								return;
							}
							
							Postgres.query('INSERT INTO votes_votes VALUE (' + voteID + ', ' + userID + ', ' + choiceID + ')', function(err) {
								if (err) {
									msg.reply('Internal pony error');
									return;
								}
								
								Postgres.query('UPDATE votes_choices SET "VOTES" = "VOTES" + 1 WHERE "VOTE" = ' + voteID + ' AND "CHOICEID" = ' + choiceID, function(err) {
									if (err) {
										msg.reply('Internal pony error');
										return;
									}
									
									msg.reply('You voted for ' + utf8.decode(data[0].NAME) + ' in ' + utf8.decode(voteData.NAME) + '!');
								});
							});
						});
					} else {
						Postgres.query('SELECT "CHOICEID", "NAME" FROM votes_choices WHERE "VOTE" = ' + voteID + ' AND "NAME" LIKE ' + Postgres.escape('%' + voteCMD + '%'), function(err, data) {
							if (err) {
								msg.reply('Internal pony error');
								return;
							}
							
							if (!data || !data[0]) {
								msg.reply('No such choice named: ' + voteCMD);
								return;
							}
							
							let choiceID = data[0].CHOICEID;
							
							Postgres.query('INSERT INTO votes_votes VALUE (' + voteID + ', ' + userID + ', ' + choiceID + ')', function(err) {
								if (err) {
									msg.reply('Internal pony error');
									return;
								}
								
								Postgres.query('UPDATE votes_choices SET "VOTES" = "VOTES" + 1 WHERE "VOTE" = ' + voteID + ' AND "CHOICEID" = ' + choiceID, function(err) {
									if (err) {
										msg.reply('Internal pony error');
										return;
									}
									
									msg.reply('You voted for ' + utf8.decode(data[0].NAME) + ' in ' + utf8.decode(voteData.NAME) + '!');
								});
							});
						});
					}
				});
			});
		}
	}
});

