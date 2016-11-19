
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
	delay: 5,
	
	func: function(args, cmd, rawcmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		if (!url) {
			url = DBot.LastURLInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;';
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1];
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;';
		
		var fPath = DBot.WebRoot + '/reflect/' + hash + '.' + ext;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_right.' + ext;
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_right.' + ext;
		
		var msgNew;
		var iShouldDelete = false;
		
		msg.reply(DBot.GenerateWaitMessage()).then(function(i) {
			msgNew = i;
			
			if (iShouldDelete)
				msgNew.delete(0);
		});
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					iShouldDelete = true;
					if (msgNew)
						msgNew.delete(0);
					
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/reflect', fPath]);
					
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
						
						iShouldDelete = true;
						if (msgNew)
							msgNew.delete(0);
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
	delay: 5,
	
	func: function(args, cmd, rawcmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		if (!url) {
			url = DBot.LastURLInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;';
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1];
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;';
		
		var fPath = DBot.WebRoot + '/reflect/' + hash + '.' + ext;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_left.' + ext;
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_left.' + ext;
		
		var msgNew;
		var iShouldDelete = false;
		
		msg.reply(DBot.GenerateWaitMessage()).then(function(i) {
			msgNew = i;
			
			if (iShouldDelete)
				msgNew.delete(0);
		});
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					iShouldDelete = true;
					if (msgNew)
						msgNew.delete(0);
					
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/reflect', fPath]);
					
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
						
						iShouldDelete = true;
						if (msgNew)
							msgNew.delete(0);
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
});

DBot.RegisterCommand({
	name: 'vblend',
	
	help_args: '<url>',
	desc: 'Reflects image at vertical. Displays both sides of image by blending them',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, rawcmd, msg) {
		var url = args[0];
		
		if (typeof(url) == 'object')
			url = url.avatarURL;
		
		if (!url) {
			url = DBot.LastURLInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;';
			}
		}
		
		var hash = DBot.HashString(url);
		var uObj = URL.parse(url);
		var path = uObj.pathname;
		var split = path.split('.');
		var ext = split[split.length - 1];
		
		if (!DBot.HaveValue(allowed, ext))
			return 'Invalid url maybe? ;w;';
		
		var fPath = DBot.WebRoot + '/reflect/' + hash + '.' + ext;
		var fPathProcessed = DBot.WebRoot + '/reflect/' + hash + '_blend.' + ext;
		var fPathProcessedURL = DBot.URLRoot + '/reflect/' + hash + '_blend.' + ext;
		
		var msgNew;
		var iShouldDelete = false;
		
		msg.reply(DBot.GenerateWaitMessage()).then(function(i) {
			msgNew = i;
			
			if (iShouldDelete)
				msgNew.delete(0);
		});
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					iShouldDelete = true;
					if (msgNew)
						msgNew.delete(0);
					
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('bash', ['./resource/reflect', fPath]);
					
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
						
						iShouldDelete = true;
						if (msgNew)
							msgNew.delete(0);
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
});
