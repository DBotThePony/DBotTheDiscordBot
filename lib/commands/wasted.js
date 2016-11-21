
const child_process = require('child_process');
const spawn = child_process.spawn;
const URL = require('url');
var unirest = require('unirest');
var fs = DBot.fs;

fs.stat(DBot.WebRoot + '/wasted', function(err, stat) {
	if (!stat)
		fs.mkdir(DBot.WebRoot + '/wasted');
});

module.exports = {
	name: 'wasted',
	
	help_args: '<user>',
	desc: 'wasted',
	allowUserArgument: true,
	
	func: function(args, cmd, rawcmd, msg) {
		if (typeof(args[0]) != 'object')
			return 'Must be an user ;n;';
		
		var url = args[0].avatarURL;
		
		if (!url) {
			return 'User have no avatar? ;w;';
		}
		
		var hash = DBot.HashString(url);
		
		var fPath;
		
		var fPathProcessed = DBot.WebRoot + '/wasted/' + hash + '.png';
		var fPathProcessedURL = DBot.URLRoot + '/wasted/' + hash + '.png';
		
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
					var magik = spawn('convert', [
						fPath,
						'-resize', '512x512',
						'-recolor', '.3 .1 .3 .3 .1 .3 .3 .1 .3',
						
						'-fill', 'rgba(0,0,0,0.5)',
						'-draw', 'rectangle 0, 200, 512, 300',
						'-gravity', 'South',
						'-font', 'PricedownBl-Regular',
						'-fill', 'rgb(200,30,30)',
						'-pointsize', '72',
						'-stroke', 'black',
						'-strokewidth', '3',
						'-weight', '300',
						'-draw', 'text 0,220 "WASTED"',
						
						fPathProcessed
					]);
					
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
							msg.reply('<internal pony error>');
						}
						
						iShouldDelete = true;
						if (msgNew)
							msgNew.delete(0);
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		});
	}
}

DBot.RegisterCommand({
	name: 'dead',
	alias: ['youdied', 'youdead', 'youaredead', 'youareded', 'youdied'],
	
	help_args: '<user>',
	desc: 'YOU DIED',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, rawcmd, msg) {
		if (typeof(args[0]) != 'object')
			return 'Must be an user ;n;';
		
		var url = args[0].avatarURL;
		
		if (!url) {
			return 'User have no avatar? ;w;';
		}
		
		var hash = DBot.HashString(url);
		
		var fPath;
		
		var fPathProcessed = DBot.WebRoot + '/wasted/' + hash + '_s.png';
		var fPathProcessedURL = DBot.URLRoot + '/wasted/' + hash + '_s.png';
		
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
					
					var args = [
						fPath,
						'-resize', '512x512!',
						'-recolor', '.3 .1 .3 .3 .1 .3 .3 .1 .3',
						
						'-fill', 'rgba(0,0,0,0.05)'
					]
					
					for (var i = 180; i <= 200; i++) {
						args.push('-draw', 'rectangle 0, ' + i + ', 512, ' + (500 - i));
					}
					
					args.push(
						'-gravity', 'South',
						'-font', 'OptimusPrinceps',
						'-fill', 'rgb(160,30,30)',
						'-pointsize', '100',
						'-stroke', 'black',
						'-draw', 'text 0,200 "YOU DIED"',
						fPathProcessed
					);
					
					var magik = spawn('convert', args);
					
					
					
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
							msg.reply('<internal pony error>');
						}
						
						iShouldDelete = true;
						if (msgNew)
							msgNew.delete(0);
					});
				}
			});
		}
		
		DBot.LoadImageURL(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		});
	}
});
