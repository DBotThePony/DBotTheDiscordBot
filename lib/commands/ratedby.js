
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/ratedby');

module.exports = {
	name: 'ratedby',
	
	help_args: '"<top text>" "<age (numbers)>" "<string1>" ...',
	desc: 'Generates a (simple) "Rated By" badge',
	
	func: function(args, cmd, msg) {
		if (!args[0]) {
			return DBot.CommandError('Must specify top text ;w;', 'ratedby', args, 1);
		}
		
		if (!args[1]) {
			return DBot.CommandError('Must specify age ;w;', 'ratedby', args, 2);
		}
		
		if (!args[2]) {
			return DBot.CommandError('Must specify at least one string ;w;', 'ratedby', args, 3);
		}
		
		var age = Util.ToNumber(args[1]);
		var ageArg = args[1];
		
		if (age) {
			ageArg = args[1] + '+™';
		}
		
		var ageLen = ageArg.toString().length;
		var sha = DBot.HashString(msg.author.id + ' ' + cmd);
		var fpath = DBot.WebRoot + '/ratedby/' + sha + '.png';
		var fpathU = DBot.URLRoot + '/ratedby/' + sha + '.png';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.reply(fpathU);
			} else {
				var magikArgs = [
					'-size', '640x350', 'canvas:black', '-background', 'black', '-fill', 'white',
					'-draw', 'rectangle 3,3 637,6',
					'-draw', 'rectangle 3,3 6,347',
					'-draw', 'rectangle 6,347 637,344',
					'-draw', 'rectangle 637,6 634,344',
					'-draw', 'rectangle 15,40 195,300',
					'-draw', 'rectangle 205,40 625,300',
					
					'-font', 'BebasNeue', '-gravity', 'NorthWest', '-pointsize', '36',
					'-draw', 'text 15,4 ' + Util.escape(args[0]),
					'-draw', 'text ' + (600 - ageLen * 10) + ',4 "' + ageArg + '"',
					'-draw', 'text 15,300 "' + msg.author.username + '\'s CONTENT RATING"',
					
					'-pointsize', '300', '-fill', 'black',
					'-draw', 'rotate -20 text 10,40 "' + args[0].substr(0, 1) + '"',
					'-pointsize', '36',
				];
				
				for (let i = 2; i < args.length; i++) {
					magikArgs.push('-draw', 'text 220,' + (50 + (i - 2) * 30) + ' ' + Util.escape(args[i]));
				}
				
				magikArgs.push(fpath);
				
				var magik = spawn('convert', magikArgs);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code == 0) {
						msg.reply(fpathU);
					} else {
						msg.reply('CONTENT RATED BY ERROR! WTF?');
					}
				});
			}
		});
	}
}
