
var getRandom = 'https://trixiebooru.org/images/random';
var http = require('https');

DBot.CreateTagsSpace('derpibooru', [
	'anthro',
	'grimdark',
	'suggestive',
	'plot',
	'butt',
]);

module.exports = {
	name: 'derpibooru',
	alias: ['pbooru', 'dbooru'],
	
	argNeeded: false,
	
	help_args: '',
	desc: 'Posts link to a random image from derpibooru',
	
	func: function(args, cmd, rawcmd, msg) {
		var options = {
			host: 'trixiebooru.org',
			port: 443,
			protocol: 'https:',
			path: '/images/random',
		};
		
		var msgNew;
		msg.reply('Hold on').then(function(i) {msgNew = i});
		
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
					var target = parse.representations.medium || parse.representations.small || parse.image;
					
					if (msgNew)
						msgNew.delete(0);
					
					msg.reply('https:' + target + '\nhttps://trixiebooru.org/' + myID);
				});
			}).end();
		}).end();
	},
}
