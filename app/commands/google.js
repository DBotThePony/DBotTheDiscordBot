
var unirest = require('unirest');
var JSON3 = require('json3');
var fs = require('fs');

fs.stat(DBot.WebRoot + '/google', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/google');
});

var Search = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAhhmtK4vvqV4ryhhbPeJAJAjlRmzNP-2g&cx=011142896060985630711:sibr51l3m7a&q=';

DBot.CreateTagsSpace('google', [
	'fuck',
	'dick',
	'fap',
	'port',
	'cock',
	'ass',
	'assfuck',
	'fucking',
	'pron',
	'shit',
	'anal',
	'hentai',
	'ecchi',
	'echi',
	'scum',
	'r34',
	'rule34',
	'pornhub',
]);

module.exports = {
	name: 'google',
	alias: ['search'],
	
	argNeeded: true,
	delay: 3,
	more: true,
	
	help_args: '<phrase>',
	desc: 'Search a site in google',
	
	func: function(args, cmd, msg, previousStuff) {
		var enc = encodeURIComponent(cmd.toLowerCase());
		var url = Search + enc;
		var hash = DBot.HashString(enc);
		var cachePath = DBot.WebRoot + '/google/' + hash + '.json';
		
		var ServerTags;
		var ClientTags = DBot.UserTags(msg.author, 'google');
		var ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'google');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'google');
		}
		
		if (!(msg.channel.name || 'private').match('nsfw')) {
			for (var k in args) {
				var split = args[k].split(' ');
				
				for (var i in split) {
					if (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i])) {
						return 'Search string contains tags that was banned by server, client or even you ;n;';
					}
				}
			}
		}
		
		msg.channel.startTyping();
		
		var continueSearch = function(data, isCached) {
			msg.channel.stopTyping();
			
			try {
				var items = data.items;
				
				if (!items || !items[0])
					return msg.reply('None found ;n;');
				
				var items2;
				
				if (!previousStuff)
					items2 = items;
				else {
					items2 = [];
					
					for (var i2 in items) {
						var hit = false;
						
						for (var i in previousStuff) {
							if (previousStuff[i] == items[i2].link) {
								hit = true;
								break;
							}
						}
						
						if (!hit)
							items2.push(items[i2]);
					}
				}
				
				if (!items2[0]) {
					msg.reply('Onoh! No more results ;n;');
					return;
				}
				
				var result;
				
				if (previousStuff)
					result = DBot.RandomArray(items2);
				else
					result = items2[0];
				
				var output = 'Title: ' + result.title;
				
				if (isCached) {
					output = '(results are cached)\n' + output;
				}
				
				output += '\n```' + result.snippet + '```\n' + result.link;
				
				msg.reply(output);
			} catch(err) {
				msg.reply('<internal pony error>');
				console.error(err);
			}
		}
		
		fs.stat(cachePath, function(err, stat) {
			if (stat) {
				fs.readFile(cachePath, 'utf8', function(err, data) {
					continueSearch(JSON3.parse(data), true);
				});
			} else {
				unirest.get(url)
				.end(function(result) {
					if (!result.body) {
						msg.channel.stopTyping();
						msg.reply('wtf with google');
						return;
					}
					
					continueSearch(result.body);
					
					fs.writeFile(cachePath, result.raw_body);
				});
			}
		});
	}
}

DBot.RegisterCommand({
	name: 'wiki',
	alias: ['wikipedia'],
	
	argNeeded: true,
	delay: 3,
	more: true,
	
	help_args: '<phrase>',
	desc: 'Search stuff in Wikipedia.\nThis uses Google tag ban space.',
	
	func: function(args, cmd, msg, previousStuff) {
		var enc = encodeURIComponent('site:wikipedia.org ' + cmd.toLowerCase());
		var url = Search + enc;
		var hash = DBot.HashString(enc);
		var cachePath = DBot.WebRoot + '/google/' + hash + '.json';
		
		var ServerTags;
		var ClientTags = DBot.UserTags(msg.author, 'google');
		var ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'google');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'google');
		}
		
		if (!(msg.channel.name || 'private').match('nsfw')) {
			for (var k in args) {
				var split = args[k].split(' ');
				
				for (var i in split) {
					if (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i])) {
						return 'Search string contains tags that was banned by server, client or even you ;n;';
					}
				}
			}
		}
		
		msg.channel.startTyping();
		
		var continueSearch = function(data, isCached) {
			msg.channel.stopTyping();
			
			try {
				var items = data.items;
				
				if (!items || !items[0])
					return msg.reply('None found ;n;');
				
				var items2;
				
				if (!previousStuff)
					items2 = items;
				else {
					items2 = [];
					
					for (var i2 in items) {
						var hit = false;
						
						for (var i in previousStuff) {
							if (previousStuff[i] == items[i2].link) {
								hit = true;
								break;
							}
						}
						
						if (!hit)
							items2.push(items[i2]);
					}
				}
				
				if (!items2[0]) {
					msg.reply('Onoh! No more results ;n;');
					return;
				}
				
				var result;
				
				if (previousStuff)
					result = DBot.RandomArray(items2);
				else
					result = items2[0];
				
				var output = 'Title: ' + result.title;
				
				if (isCached) {
					output = '(results are cached)\n' + output;
				}
				
				output += '\n```' + result.snippet + '```\n' + result.link;
				
				msg.reply(output);
			} catch(err) {
				msg.reply('<internal pony error>');
				console.error(err);
			}
		}
		
		fs.stat(cachePath, function(err, stat) {
			if (stat) {
				fs.readFile(cachePath, 'utf8', function(err, data) {
					continueSearch(JSON3.parse(data), true);
				});
			} else {
				unirest.get(url)
				.end(function(result) {
					if (!result.body) {
						msg.channel.stopTyping();
						msg.reply('wtf with google');
						return;
					}
					
					continueSearch(result.body);
					
					fs.writeFile(cachePath, result.raw_body);
				});
			}
		});
	}
});

DBot.RegisterCommand({
	name: 'youtube',
	alias: ['ytube'],
	
	argNeeded: true,
	delay: 3,
	more: true,
	
	help_args: '<phrase>',
	desc: 'Search stuff in YouTube.\nThis uses Google tag ban space.',
	
	func: function(args, cmd, msg, previousStuff) {
		var enc = encodeURIComponent('site:youtube.com ' + cmd.toLowerCase());
		var url = Search + enc;
		var hash = DBot.HashString(enc);
		var cachePath = DBot.WebRoot + '/google/' + hash + '.json';
		
		var ServerTags;
		var ClientTags = DBot.UserTags(msg.author, 'google');
		var ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'google');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'google');
		}
		
		if (!(msg.channel.name || 'private').match('nsfw')) {
			for (var k in args) {
				var split = args[k].split(' ');
				
				for (var i in split) {
					if (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i])) {
						return 'Search string contains tags that was banned by server, client or even you ;n;';
					}
				}
			}
		}
		
		msg.channel.startTyping();
		
		var continueSearch = function(data, isCached) {
			msg.channel.stopTyping();
			
			try {
				var items = data.items;
				
				if (!items || !items[0])
					return msg.reply('None found ;n;');
				
				var items2;
				
				if (!previousStuff)
					items2 = items;
				else {
					items2 = [];
					
					for (var i2 in items) {
						var hit = false;
						
						for (var i in previousStuff) {
							if (previousStuff[i] == items[i2].link) {
								hit = true;
								break;
							}
						}
						
						if (!hit)
							items2.push(items[i2]);
					}
				}
				
				if (!items2[0]) {
					msg.reply('Onoh! No more results ;n;');
					return;
				}
				
				var result;
				
				if (previousStuff)
					result = DBot.RandomArray(items2);
				else
					result = items2[0];
				
				var output = 'Title: ' + result.title;
				
				if (isCached) {
					output = '(results are cached)\n' + output;
				}
				
				output += '\n```' + result.snippet + '```\n' + result.link;
				
				msg.reply(output);
			} catch(err) {
				msg.reply('<internal pony error>');
				console.error(err);
			}
		}
		
		fs.stat(cachePath, function(err, stat) {
			if (stat) {
				fs.readFile(cachePath, 'utf8', function(err, data) {
					continueSearch(JSON3.parse(data), true);
				});
			} else {
				unirest.get(url)
				.end(function(result) {
					if (!result.body) {
						msg.channel.stopTyping();
						msg.reply('wtf with google');
						return;
					}
					
					continueSearch(result.body);
					
					fs.writeFile(cachePath, result.raw_body);
				});
			}
		});
	}
});
