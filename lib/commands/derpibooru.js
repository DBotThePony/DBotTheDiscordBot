
var http = require('https');

DBot.CreateTagsSpace('derpibooru', [
	'anthro',
	'grimdark',
	'suggestive',
	'plot',
	'butt',
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

module.exports = {
	name: 'derpibooru',
	alias: ['pbooru', 'dbooru'],
	
	argNeeded: false,
	
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
			msg.reply('Hold on').then(function(i) {
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
						if (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i])) {
							searchFunc();
							return;
						}
					}
					
					if (msgNew)
						msgNew.delete(0);
					
					iShouldDelete = true;
					
					msg.reply('Tags: ' + itags + '\nhttps:' + target + '\nhttps://trixiebooru.org/' + myID);
				});
			}
			
			searchFunc();
		}
	},
}
