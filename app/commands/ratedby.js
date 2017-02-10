
const child_process = DBot.js.child_process;
const spawn = child_process.spawn;
const fs = DBot.js.fs;

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
		
		let age = Number.from(args[1]);
		let ageArg = args[1];
		
		if (age) {
			ageArg = args[1] + '+™';
		}
		
		let ageLen = ageArg.toString().length;
		let sha = String.hash(msg.author.id + ' ' + cmd);
		let fpath = DBot.WebRoot + '/ratedby/' + sha + '.png';
		let fpathU = DBot.URLRoot + '/ratedby/' + sha + '.png';
		
		msg.channel.startTyping();
		
		fs.stat(fpath, function(err, stat) {
			if (msg.checkAbort()) return;
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(fpathU);
			} else {
				let magikArgs = [
					'-size', '640x350', 'canvas:black', '-background', 'black', '-fill', 'white',
					'-draw', 'rectangle 3,3 637,6',
					'-draw', 'rectangle 3,3 6,347',
					'-draw', 'rectangle 6,347 637,344',
					'-draw', 'rectangle 637,6 634,344',
					'-draw', 'rectangle 15,40 195,300',
					'-draw', 'rectangle 205,40 625,300',
					
					'-font', 'BebasNeue', '-gravity', 'NorthWest', '-pointsize', '36',
					'-draw', 'text 15,4 ' + Postgres.escape(args[0]),
					'-draw', 'text ' + (600 - ageLen * 10) + ',4 "' + ageArg + '"',
					'-draw', 'text 15,300 "' + msg.author.username + '\'s CONTENT RATING"',
					
					'-pointsize', '300', '-fill', 'black',
					'-draw', 'rotate -20 text 10,40 "' + args[0].substr(0, 1) + '"',
					'-pointsize', '36',
				];
				
				for (let i = 2; i < args.length; i++) {
					magikArgs.push('-draw', 'text 220,' + (50 + (i - 2) * 30) + ' ' + Postgres.escape(args[i]));
				}
				
				magikArgs.push(fpath);
				
				let magik = spawn('convert', magikArgs);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code == 0) {
						msg.reply(fpathU);
					} else {
						msg.reply('CONTENT RATED BY ERROR! WTF?');
					}
					
					msg.channel.stopTyping();
				});
			}
		});
	}
}
