
var http = require('https');
var unirest = require('unirest');
var JSON3 = require('json3');
var fs = require('fs');

DBot.CreateTagsSpace('derpibooru', [
	'anthro',
	'grimdark',
	'suggestive',
	'plot',
	'butt',
	'questionable',
	'explicit',
	'fuck',
	'cum',
	'cock',
	'dick',
]);

fs.stat(DBot.WebRoot + '/derpibooru', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/derpibooru');
	
	fs.stat(DBot.WebRoot + '/derpibooru/search', function(err, stat) {
		if (!stat)
			fs.mkdir(DBot.WebRoot + '/derpibooru/search');
	});
	
	fs.stat(DBot.WebRoot + '/derpibooru/image', function(err, stat) {
		if (!stat)
			fs.mkdir(DBot.WebRoot + '/derpibooru/image');
	});
});

var GetImage = function(ID, callback) {
	var path = DBot.WebRoot + '/derpibooru/image/' + ID + '.json';
	
	fs.stat(path, function(err, stat) {
		if (stat) {
			fs.readFile(path, 'utf8', function(err, data) {
				if (data == '') {
					callback({}, ID, true);
					return;
				}
				
				callback(JSON3.parse(data), ID);
			});
		} else {
			unirest.get('https://trixiebooru.org/' + ID + '.json')
			.end(function(reply) {
				if (reply.raw_body == '') {
					callback({}, ID, true);
					fs.writeFile(path, '');
					return;
				}
				
				fs.writeFile(path, reply.raw_body);
				callback(reply.body, ID);
			});
		}
	});
}

var getRandomImage = function(callback) {
	var options = {
		host: 'trixiebooru.org',
		port: 443,
		protocol: 'https:',
		path: '/images/random',
	};
	
	http.request(options, function(response) {
		var location = response.headers.location;
		var split = location.split('/');
		var myID = split[split.length - 1];
		
		GetImage(myID, callback);
	}).end();
}

var bannedChars = [
	'||',
	'AND',
	'OR',
	'&&',
	'!',
	'NOT',
];

module.exports = {
	name: 'derpibooru',
	alias: ['pbooru', 'dbooru'],
	
	argNeeded: false,
	delay: 3,
	more: true,
	
	help_args: '[tags/image ID]',
	desc: 'Posts link to a image from derpibooru.\nIf no tags specified, posts a random image',
	
	func: function(args, cmd, rawcmd, msg, previousStuff) {
		var ServerTags;
		var ClientTags = DBot.UserTags(msg.author, 'derpibooru');
		var ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'derpibooru');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'derpibooru');
		}
		
		var num;
		
		if (args[0]) {
			if (args[0].match(/^[0-9]+$/)) {
				var tryNum = Number(args[0]);
			
				if (tryNum == tryNum) { // NaN ???
					if (tryNum <= 0)
						tryNum = 1;
					
					num = tryNum;
				}
			}
		}
		
		if (!args[0]) {
			var msgNew;
			var tries = 0;
			var iShouldDelete = false;
			msg.reply(DBot.GenerateWaitMessage()).then(function(i) {
				msgNew = i;
				
				if (iShouldDelete)
					msgNew.delete(0);
			});
			
			var searchFunc;
			
			searchFunc = function() {
				tries++;
				
				if (tries >= 4) {
					if (msgNew)
						msgNew.delete(0);
					
					iShouldDelete = true;
					
					msg.reply('Could not find an valid image. Maybe you or server banned most of valid tags');
					return;
				}
				
				getRandomImage(function(parse, myID) {
					var target = parse.representations.medium || parse.representations.small || parse.image;
					var itags = parse.tags;
					var split = itags.split(', ');
					
					for (var i in split) {
						if (msg.channel.name != 'nsfw' && (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i]))) {
							searchFunc();
							return;
						}
					}
					
					if (msgNew)
						msgNew.delete(0);
					
					iShouldDelete = true;
					
					msg.reply('Tags: ' + itags + '\n<https://trixiebooru.org/' + myID +'>\nhttps:' + target);
				});
			}
			
			searchFunc();
		} else if (num) {
			var msgNew;
			var iShouldDelete = false;
			
			msg.reply(DBot.GenerateWaitMessage()).then(function(i) {
				msgNew = i;
				
				if (iShouldDelete)
					msgNew.delete(0);
			});
			
			GetImage(num, function(data, ID, isError) {
				if (isError) {
					if (msgNew)
						msgNew.delete(0);
					
					iShouldDelete = true;
					
					msg.reply('Not a valid image ID!');
					return;
				}
				
				var target = data.representations.medium || data.representations.small || data.image;
				var itags = data.tags;
				var split = itags.split(', ');
				
				for (var i in split) {
					if (msg.channel.name != 'nsfw' && (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i]))) {
						if (msgNew)
							msgNew.delete(0);
						
						iShouldDelete = true;
						
						msg.reply('Image have tags that was blocked by server, channel or even you ;n; Next tag was banned: ' + split[i]);
						return;
					}
				}
				
				if (msgNew)
					msgNew.delete(0);
				
				iShouldDelete = true;
				
				msg.reply('Tags: ' + itags + '\n<https://trixiebooru.org/' + ID +'>\nhttps:' + target);
			});
		} else {
			var encode = '';
			var first = true;
			
			for (var i in args) {
				var str = args[i];
				
				for (var bk in bannedChars) {
					if (str.search(bannedChars[bk]) > 0) {
						msg.reply('Illegal charactets. AND, OR, NOT are also blocked');
						return;
					}
					
					if (msg.channel.name != 'nsfw' && (ClientTags.isBanned(str) || ServerTags && ServerTags.isBanned(str) || ChannelTags && ChannelTags.isBanned(str))) {
						msg.reply('You are trying to search by tag that was blocked by server, channel, or even you. Next tag was banned: ' + str);
						return;
					}
				}
				
				if (first) {
					first = false;
					encode = encodeURIComponent(str);
				} else {
					encode += ' AND ' + encodeURIComponent(str);
				}
			}
			
			var msgNew;
			var iShouldDelete = false;
			
			msg.reply(DBot.GenerateWaitMessage()).then(function(i) {
				msgNew = i;
				
				if (iShouldDelete)
					msgNew.delete(0);
			});
			
			var path = DBot.WebRoot + '/derpibooru/search/' + DBot.HashString(encode) + '.json';
			
			var continueLoad = function(parsed, isCached) {
				var valids = [];
				
				for (var k in parsed.search) {
					var data = parsed.search[k];
					var itags = data.tags;
					
					var split = itags.split(', ');
					var hit = false;
					
					for (var i in split) {
						if (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i])) {
							hit = true;
							break;
						}
					}
					
					if (!hit)
						valids.push(data);
				}
				
				if (!valids[0]) {
					if (isCached)
						msg.reply('(cached) Sorry, no results');
					else
						msg.reply('Sorry, no results');
					
					if (msgNew)
						msgNew.delete(0);
					
					iShouldDelete = true;
					
					return;
				}
				
				var valids2;
				
				if (!previousStuff)
					valids2 = valids;
				else {
					valids2 = [];
					
					for (var i2 in valids) {
						var hit = false;
						
						for (var i in previousStuff) {
							if (previousStuff[i] == valids[i2].id) {
								hit = true;
								break;
							}
						}
						
						if (!hit)
							valids2.push(valids[i2]);
					}
				}
				
				if (!valids2[0]) {
					msg.reply('Oops! No more unique results!\nMight you want reset me by typing }derpibooru again?');
					
					if (msgNew)
						msgNew.delete(0);
					
					iShouldDelete = true;
					
					return;
				}
				
				var data = DBot.RandomArray(valids2);
				var target = data.representations.medium || data.representations.small || data.image;
				
				if (previousStuff)
					previousStuff.push(data.id);
				
				if (isCached)
					msg.reply('(cached results)\nTags: ' + data.tags + '\n<https://trixiebooru.org/' + data.id + '>\nhttps:' + target);
				else
					msg.reply('Tags: ' + data.tags + '\n<https://trixiebooru.org/' + data.id + '>\nhttps:' + target);
				
				if (msgNew)
					msgNew.delete(0);
				
				iShouldDelete = true;
			}
			
			fs.stat(path, function(err, stat) {
				if (stat && ((stat.ctime.getTime() / 1000) > (UnixStamp() - 3600))) {
					try {
						fs.readFile(path, 'utf8', function(err, data) {
							continueLoad(JSON3.parse(data), true);
						});
					} catch(err) {
						console.log(err);
						msg.reply('Uh oh, i broke for now');
						
						if (msgNew)
							msgNew.delete(0);
						
						iShouldDelete = true;
					}
				} else {
					unirest.get('https://trixiebooru.org/search.json?q=' + encode)
					.end(function (response) {
						try {
							var parsed = response.body;
							if (!parsed) {
								msg.reply('Derpibooru is down! Onoh!');
								
								if (msgNew)
									msgNew.delete(0);
								
								iShouldDelete = true;
								return;
							}
							
							continueLoad(parsed);
							fs.writeFile(path, response.raw_body);
						} catch(err) {
							console.log(err);
							msg.reply('Uh oh, i broke for now');
							
							if (msgNew)
								msgNew.delete(0);
							
							iShouldDelete = true;
						}
					});
				}
			});
		}
	},
}
