
const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = DBot.fs;

Util.mkdir(DBot.WebRoot + '/pixel');

module.exports = {
	name: 'pixel',
	alias: ['pixelizate', 'pixelisate'],
	
	help_args: '<url>',
	desc: 'Pixelizate an image',
	allowUserArgument: true,
	
	func: function(args, cmd, msg) {
		let url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		url = url || DBot.LastURLInChannel(msg.channel);
		if (!DBot.CheckURLImage(url))
			return 'Invalid url maybe? ;w;';
		
		let hash = DBot.HashString(CurTime() + '_' + msg.channel.id);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/pixel/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/pixel/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			IMagick.Identify(fPath, function(err, ftype, width, height) {
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				let magik = spawn('convert', [
					'-size', '10x10',
					'xc:rgb(150,150,150)',
					'-fill', 'white',
					'-draw', 'rectangle 1,1 9,9',
					'-write', 'mpr:block',
					'+delete',
					
					fPath,
					'-background', 'black',
					'-scale', '10%',
					'-scale', '1000%',
					'-size', (width + 1) + 'x' + (height + 1),
					'tile:mpr:block',
					'+swap',
					'-compose', 'Multiply',
					'-composite', fPathProcessed
				]);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					msg.channel.stopTyping();
					
					if (code != 0) {
						msg.reply('*falls on the ground and squeaks*');
						return;
					}
					
					msg.reply(fPathProcessedURL);
				});
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
