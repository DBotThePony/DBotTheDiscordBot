
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = DBot.fs;

Util.mkdir(DBot.WebRoot + '/magik');

const combinations = [
	['40', '160'],
	['50', '150'],
	['60', '140'],
];

module.exports = {
	name: 'magik',
	alias: ['magic'],
	
	help_args: '<url>',
	desc: 'Broken seam-carving resize ;n;',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = DBot.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'magik', args, 1);
		
		let hash = DBot.HashString(url);
		
		let comb1 = DBot.RandomArray(combinations);
		let comb2 = DBot.RandomArray(combinations);
		
		let selectedDimensions = comb1[0] + '%x' + comb2[0] + '%';
		let selectedDimensions2 = comb1[1] + '%x' + comb2[1] + '%';
		
		let fPath;
		
		let newHash = DBot.HashString(url + ' ' + selectedDimensions);
		
		let fPathProcessed = DBot.WebRoot + '/magik/' + newHash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/magik/' + newHash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', ['(', '(', fPath, '-resize', '2000x2000>', ')', '-liquid-rescale', selectedDimensions, ')', '-resize', selectedDimensions2, fPathProcessed]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}
