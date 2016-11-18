
var http = require('http');
var path = 'D:/www/derpco/bot/tomb';

var endPhrases = [
	'Rest in peace',
	'Died twice',
	'Dead in sphghetti never forgetti',
];

module.exports = {
	name: 'rip',
	
	argNeeded: true,
	failMessage: 'You need at least one argument',
	
	help_args: '<first> [second 0-3]',
	desc: 'Post a RIP',
	
	func: function(args, cmd, rawcmd, msg) {
		args[1] = args[1] || DBot.RandomArray(endPhrases);
		var bArgs = '';
		
		args.forEach(function(item, i) {
			if (i > 3)
				return;
			
			bArgs += '&top' + (i + 1) + '=' + encodeURIComponent(item);
		});
		
		var hash = DBot.HashString(bArgs);
		var myPath = path + '/' + hash + '.jpg'
		
		DBot.fs.stat(myPath, function(err, result) {
			if (err || !result.isFile()) {
				var options = {
					host: 'www.tombstonebuilder.com',
					port: 80,
					protocol: 'http:',
					path: '/generate.php?' + bArgs,
				};
				
				var Stream = DBot.fs.createWriteStream(myPath);
				
				http.request(options, function(response) {
					response.on('data', function(data) {
						Stream.write(data);
					});
					
					response.on('end', function() {
						Stream.end();
						Stream.on('finish', function() {
							msg.reply('https://dbot.serealia.ca/bot/tomb/' + hash + '.jpg');
						});
					});
				}).end();
			} else {
				msg.reply('https://dbot.serealia.ca/bot/tomb/' + hash + '.jpg');
			}
		});
	},
}
