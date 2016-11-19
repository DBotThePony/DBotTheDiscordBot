
var http = require('https');
var unirest = require('unirest');

DBot.CreateTagsSpace('derpibooru', [
	'anthro',
	'grimdark',
	'suggestive',
	'plot',
	'butt',
	'questionable',
	'explicit',
]);

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
		
		var options = {
			host: 'trixiebooru.org',
			port: 443,
			protocol: 'https:',
			path: '/' + myID + '.json',
		};
		
		http.request(options, function(response) {
			var chunks = '';
			
			response.on('data', function(data) {
				chunks += data;
			});
			
			response.on('end', function() {
				var parse = JSON.parse(chunks);
				callback(parse, myID);
			});
		}).end();
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
	
	help_args: '[tags]',
	desc: 'Posts link to a image from derpibooru.\nIf no tags specified, posts a random image',
	
	func: function(args, cmd, rawcmd, msg) {
		var ServerTags;
		var ClientTags = DBot.UserTags(msg.author, 'derpibooru');
		var ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'derpibooru');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'derpibooru');
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
					
					msg.reply('Tags: ' + itags + '\nhttps://trixiebooru.org/' + myID +'\nhttps:' + target);
				});
			}
			
			searchFunc();
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
						msg.reply('You are trying to search by tag that was blocked by server, channel, or even you.');
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
			
			unirest.get('https://trixiebooru.org/search.json?q=' + encode)
			.end(function (response) {
				try {
					var parsed = response.body;
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
						msg.reply('Sorry, no results');
						return;
					}
					
					var data = DBot.RandomArray(valids);
					var target = data.representations.medium || data.representations.small || data.image;
					
					msg.reply('Tags: ' + data.tags + '\nhttps://trixiebooru.org/' + data.id + '\nhttps:' + target);
					
					if (msgNew)
						msgNew.delete(0);
					
					iShouldDelete = true;
				} catch(err) {
					console.log(err);
					msg.reply('Uh oh, i broke for now');
					
					if (msgNew)
						msgNew.delete(0);
					
					iShouldDelete = true;
				}
			});
		}
	},
}
