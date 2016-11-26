
const child_process = require('child_process');
const spawn = child_process.spawn;
var unirest = require('unirest');
var fs = require('fs');

fs.stat(DBot.WebRoot + '/triggered', function(err, stat) {
	if (!stat)
		fs.mkdir(DBot.WebRoot + '/triggered');
});

module.exports = {
	name: 'triggered',
	
	argNeeded: true,
	allowUserArgument: true,
	
	help_args: '<user>',
	desc: '<TRIGGERED>',
	
	func: function(args, cmd, rawcmd, msg) {
		var user = args[0];
		
		if (!user)
			return 'Nu user argument ;w;';
		
		if (typeof(user) != 'object')
			return 'Invalid user argument. Please Use @User';
		
		var url = user.avatarURL;
		
		if (!url)
			return 'User have no avatar ;w;';
		
		var hash = DBot.HashString(url);
		
		var fpath = DBot.WebRoot + '/triggered/' + hash + '.png';
		var fpath_t = DBot.WebRoot + '/triggered/' + hash + '_tmp.jpg';
		var fpath_t2 = DBot.WebRoot + '/triggered/' + hash + '_tmp.png';
		var upath = DBot.URLRoot + '/triggered/' + hash + '.png';
		
		fs.stat(fpath, function(err, stat) {
			if (stat) {
				msg.reply(upath);
			} else {
				unirest.get(url)
				.encoding(null)
				.end(function(result) {
					var body = result.raw_body;
					
					if (!body)
						return;
					
					fs.writeFile(fpath_t, body, {flag: 'w'}, function(err) {
						if (err)
							return;
						
						var magik = spawn('convert', [fpath_t, '-resize', '256', fpath_t2]);
						
						magik.stderr.on('data', function(data) {
							console.error(data.toString());
						});
						
						magik.on('close', function(code) {
							if (code == 0) {
								var magik = spawn('convert', [fpath_t2, './resource/files/triggered.jpg', '-append', fpath]);
								
								magik.stderr.on('data', function(data) {
									console.error(data.toString());
								});
								
								magik.on('close', function(code) {
									if (code == 0) {
										msg.reply(upath);
										fs.unlink(fpath_t, function() {});
										fs.unlink(fpath_t2, function() {});
									} else {
										msg.reply('I am cracked up ;w;');
									}
								});
							} else {
								msg.reply('I am cracked up ;w;');
							}
						});
					});
				});
			}
		});
	},
}
