
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

fs.stat(DBot.WebRoot + '/reflect', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/reflect');
});

var allowed = [
	'jpeg',
	'jpg',
	'png',
	'tif',
	'bmp',
];

module.exports = {
	name: 'waaw',
	
	help_args: '<url>',
	desc: 'Reflects image at vertical. Displays only **right** side of image',
	allowUserArgument: true,
	delay: 2,
	
	func: function(args, cmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['waaw'], 2, args);
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['waaw'], 2, args);
		
		var fPath = DBot.WebRoot + '/reflect/' + hash + '.' + ext;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_right.' + ext;
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_right.' + ext;
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/scripts/reflect', fPath]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							fs.rename('./' + hash + '_right.' + ext, DBot.WebRoot + '/reflect/' + hash + '_right.' + ext, function() {
								fs.rename('./' + hash + '_left.' + ext, DBot.WebRoot + '/reflect/' + hash + '_left.' + ext, function() {
									fs.rename('./' + hash + '_blend.' + ext, DBot.WebRoot + '/reflect/' + hash + '_blend.' + ext, function() {
										msg.reply(fPathProcessedURL);
									});
								});
							});
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
					});
				}
			});
		}
		
		fs.stat(fPath, function(err, stat) {
			if (stat && stat.isFile()) {
				ContinueFunc();
			} else {
				unirest.get(url)
				.encoding(null)
				.end(function(result) {
					var body = result.raw_body;
					
					if (!body)
						return;
					
					fs.writeFile(fPath, body, {flag: 'w'}, function(err) {
						if (err)
							return;
						
						ContinueFunc();
					});
				});
			}
		});
	}
}

DBot.RegisterCommand({
	name: 'haah',
	
	help_args: '<url>',
	desc: 'Reflects image at vertical. Displays only **left** side of image',
	allowUserArgument: true,
	delay: 2,
	
	func: function(args, cmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['haah'], 2, args);
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['haah'], 2, args);
		
		var fPath = DBot.WebRoot + '/reflect/' + hash + '.' + ext;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_left.' + ext;
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_left.' + ext;
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/scripts/reflect', fPath]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							fs.rename('./' + hash + '_right.' + ext, DBot.WebRoot + '/reflect/' + hash + '_right.' + ext, function() {
								fs.rename('./' + hash + '_left.' + ext, DBot.WebRoot + '/reflect/' + hash + '_left.' + ext, function() {
									fs.rename('./' + hash + '_blend.' + ext, DBot.WebRoot + '/reflect/' + hash + '_blend.' + ext, function() {
										msg.reply(fPathProcessedURL);
									});
								});
							});
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
					});
				}
			});
		}
		
		fs.stat(fPath, function(err, stat) {
			if (stat && stat.isFile()) {
				ContinueFunc();
			} else {
				unirest.get(url)
				.encoding(null)
				.end(function(result) {
					var body = result.raw_body;
					
					if (!body) {
						msg.channel.stopTyping();
						return;
					}
					
					fs.writeFile(fPath, body, {flag: 'w'}, function(err) {
						if (err) {
							msg.channel.stopTyping();
							return;
						}
						
						ContinueFunc();
					});
				});
			}
		});
	}
});

DBot.RegisterCommand({
	name: 'vblend',
	
	help_args: '<url>',
	desc: 'Reflects image at vertical. Displays both sides of image by blending them',
	allowUserArgument: true,
	delay: 2,
	
	func: function(args, cmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['vblend'], 2, args);
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['vblend'], 2, args);
		
		var fPath = DBot.WebRoot + '/reflect/' + hash + '.' + ext;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_blend.' + ext;
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_blend.' + ext;
		
		msg.channel.startTyping();
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.reply(fPathProcessedURL);
					msg.channel.stopTyping();
				} else {
					var magik = spawn('bash', ['./resource/scripts/reflect', fPath]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							fs.rename('./' + hash + '_right.' + ext, DBot.WebRoot + '/reflect/' + hash + '_right.' + ext, function() {
								fs.rename('./' + hash + '_left.' + ext, DBot.WebRoot + '/reflect/' + hash + '_left.' + ext, function() {
									fs.rename('./' + hash + '_blend.' + ext, DBot.WebRoot + '/reflect/' + hash + '_blend.' + ext, function() {
										msg.reply(fPathProcessedURL);
									});
								});
							});
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
					});
				}
			});
		}
		
		fs.stat(fPath, function(err, stat) {
			if (stat && stat.isFile()) {
				ContinueFunc();
			} else {
				unirest.get(url)
				.encoding(null)
				.end(function(result) {
					var body = result.raw_body;
					
					if (!body) {
						msg.channel.stopTyping();
						return;
					}
					
					fs.writeFile(fPath, body, {flag: 'w'}, function(err) {
						if (err) {
							msg.channel.stopTyping();
							return;
						}
						
						ContinueFunc();
					});
				});
			}
		});
	}
});

// Using Mirrorize

DBot.RegisterCommand({
	name: 'woow',
	
	help_args: '<url>',
	desc: 'Reflects image at horisontal. Displays only **top** side of image',
	allowUserArgument: true,
	delay: 2,
	
	func: function(args, cmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['woow'], 2, args);
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['woow'], 2, args);
		
		var fPath;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_up.png';
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_up.png';
		
		msg.channel.startTyping();
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/scripts/mirrorize', '-r', 'North', fPath, fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
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
});

DBot.RegisterCommand({
	name: 'hooh',
	
	help_args: '<url>',
	desc: 'Reflects image at horisontal. Displays only **down** side of image',
	allowUserArgument: true,
	delay: 2,
	
	func: function(args, cmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['hooh'], 2, args);
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['hooh'], 2, args);
		
		var fPath;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_down.png';
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_down.png';
		
		msg.channel.startTyping();
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/scripts/mirrorize', '-r', 'South', fPath, fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
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
});

DBot.RegisterCommand({
	name: 'flip',
	
	help_args: '<url>',
	desc: 'Flips an image',
	allowUserArgument: true,
	delay: 2,
	
	func: function(args, cmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['flip'], 2, args);
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['flip'], 2, args);
		
		var fPath;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_flip.png';
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_flip.png';
		
		msg.channel.startTyping();
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('convert', [fPath, '-flip', fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
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
});

DBot.RegisterCommand({
	name: 'flop',
	
	help_args: '<url>',
	desc: 'Flops an image',
	allowUserArgument: true,
	delay: 2,
	
	func: function(args, cmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLImageInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['flop'], 2, args);
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1].toLowerCase();
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;' + Util.HighlightHelp(['flop'], 2, args);
		
		var fPath;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_flop.png';
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_flop.png';
		
		msg.channel.startTyping();
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('convert', [fPath, '-flop', fPathProcessed]);
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('Uh oh! You are trying to break me ;n; Why? ;n;');
						}
						
						msg.channel.stopTyping();
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
});

