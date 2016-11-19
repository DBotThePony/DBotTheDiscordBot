
var unirest = require('unirest');
var JSON3 = require('json3');
var fs = require('fs');

fs.stat(DBot.WebRoot + '/google_images', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/google_images');
});

var Search = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAhhmtK4vvqV4ryhhbPeJAJAjlRmzNP-2g&cx=011142896060985630711:sibr51l3m7a&searchType=image&q=';

module.exports = {
	name: 'image',
	alias: ['gimage'],
	
	argNeeded: true,
	delay: 5,
	more: true,
	
	help_args: '<phrase>',
	desc: 'Search a image in google',
	
	func: function(args, cmd, rawcmd, msg) {
		var enc = encodeURIComponent(cmd.toLowerCase());
		var url = Search + enc;
		var hash = DBot.HashString(enc);
		var cachePath = DBot.WebRoot + '/google_images/' + hash + '.json';
		
		var ServerTags;
		var ClientTags = DBot.UserTags(msg.author, 'google');
		var ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'google');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'google');
		}
		
		if (msg.channel.name != 'nsfw') {
			for (var k in args) {
				var split = args[k].split(' ');
				
				for (var i in split) {
					if (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i])) {
						return 'Search string contains tags that was banned by server, client or even you ;n;';
					}
				}
			}
		}
		
		var continueSearch = function(data, isCached) {
			var items = data.items;
			
			if (!items || !items[0])
				return msg.reply('None found ;n;');
			
			var result = DBot.RandomArray(items);
			
			var output = '<' + result.image.contextLink + '>\n' + result.link;
			
			if (isCached) {
				output = '(results are cached)\n' + output;
			}
			
			msg.reply(output);
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
