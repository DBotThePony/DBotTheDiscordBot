
var http = require('http');
var path = 'D:/www/derpco/bot/tomb';

module.exports = {
	name: 'rip',
	
	argNeeded: true,
	failMessage: 'You need at least one argument',
	
	help_args: '<first> [second 0-3]',
	desc: 'Post a RIP',
	
	func: function(args, cmd, rawcmd, msg) {
		var bArgs = 'top1=' + encodeURIComponent(args[0]);
		
		args.forEach(function(item, i) {
			if (i == 0)
				return;
			
			if (i == 1)
				return;
			
			bArgs += '&top' + (i) + '=' + encodeURIComponent(item);
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
