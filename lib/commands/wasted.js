
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
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;';
			}
		}
		
		var hash = DBot.HashString(url);
		
		var fPath;
		
		var fPathProcessed = DBot.WebRoot + '/wasted/' + hash + '.png';
		var fPathProcessedURL = DBot.URLRoot + '/wasted/' + hash + '.png';
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('identify', [fPath]);
					
					var output = '';
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						output += data.toString();
						// console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0 && output != '') {
							var parse = output.split(' ');
							var fileName = parse[0];
							var fileType = parse[1];
							var fileSizes = parse[2];
							
							var fileSizesS = fileSizes.split('x');
							var width = Number(fileSizesS[0]);
							var height = Number(fileSizesS[1]);
							var aspectRatio = height / width;
							var aspectRatio2 = width / height;
							
							var magikArgs = [fPath];
							
							if (width < 512) {
								magikArgs.push('-resize');
								
								width = 512;
								height = Math.floor(aspectRatio * 512);
								
								magikArgs.push('256x' + height);
							}
							
							if (height < 512) {
								magikArgs.push('-resize');
								
								height = 512;
								width = Math.floor(aspectRatio2 * 512);
								
								magikArgs.push(width);
							}
							
							if (width > 1500 || height > 1500)
								msg.reply('Big Picture OwO, Cropping to 1500x1500');
							
							if (width > 1500) {
								magikArgs.push('-resize');
								
								width = 1500;
								height = Math.floor(aspectRatio * 1500);
								
								magikArgs.push('1500x' + height);
							}
							
							if (height > 1500) {
								magikArgs.push('-resize');
								
								height = 1500;
								width = Math.floor(aspectRatio2 * 1500);
								
								magikArgs.push(width);
							}
							
							magikArgs.push('-recolor', '.3 .1 .3 .3 .1 .3 .3 .1 .3', '-fill', 'rgba(0,0,0,0.5)');
							
							var signHeight = height * .2;
							
							magikArgs.push('-draw', 'rectangle 0, ' + (height / 2 - signHeight / 2) + ', ' + width + ', ' + (height / 2 + signHeight / 2));
							
							magikArgs.push(
								'-gravity', 'South',
								'-font', 'PricedownBl-Regular',
								'-fill', 'rgb(200,30,30)',
								'-stroke', 'black',
								'-strokewidth', '3',
								'-weight', '300'
							);
							
							magikArgs.push('-pointsize', String(signHeight * .8), '-draw', 'text 0,' + (height / 2 - signHeight * .45) + ' "WASTED"');
							
							magikArgs.push(fPathProcessed);
							
							var magik = spawn('convert', magikArgs);
							
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
							});
						} else {
							msg.reply('<internal pony error>');
						}
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
		var url = args[0];
		
		if (typeof(url) == 'object') {
			url = url.avatarURL;
			
			if (!url) {
				return 'Specified user have no avatar? ;w;';
			}
		}
		
		if (!url) {
			url = DBot.LastURLInChannel(msg.channel);
			
			if (!url) {
				return 'Invalid url maybe? ;w;';
			}
		}
		
		var hash = DBot.HashString(url);
		
		var fPath;
		
		var fPathProcessed = DBot.WebRoot + '/wasted/' + hash + '_s.png';
		var fPathProcessedURL = DBot.URLRoot + '/wasted/' + hash + '_s.png';
		
		var ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat && stat.isFile()) {
					msg.reply(fPathProcessedURL);
				} else {
					var magik = spawn('identify', [fPath]);
					
					var output = '';
					
					magik.stderr.on('data', function(data) {
						console.error(data.toString());
					});
					
					magik.stdout.on('data', function(data) {
						output += data.toString();
						// console.log(data.toString());
					});
					
					magik.on('close', function(code) {
						if (code == 0 && output != '') {
							var parse = output.split(' ');
							var fileName = parse[0];
							var fileType = parse[1];
							var fileSizes = parse[2];
							
							var fileSizesS = fileSizes.split('x');
							var width = Number(fileSizesS[0]);
							var height = Number(fileSizesS[1]);
							var aspectRatio = height / width;
							var aspectRatio2 = width / height;
							
							var magikArgs = [fPath];
							
							if (width < 512) {
								magikArgs.push('-resize');
								
								width = 512;
								height = Math.floor(aspectRatio * 512);
								
								magikArgs.push('256x' + height);
							}
							
							if (height < 512) {
								magikArgs.push('-resize');
								
								height = 512;
								width = Math.floor(aspectRatio2 * 512);
								
								magikArgs.push(width);
							}
							
							if (width > 1500 || height > 1500)
								msg.reply('Big Picture OwO, Cropping to 1500x1500');
							
							if (width > 1500) {
								magikArgs.push('-resize');
								
								width = 1500;
								height = Math.floor(aspectRatio * 1500);
								
								magikArgs.push('1500x' + height);
							}
							
							if (height > 1500) {
								magikArgs.push('-resize');
								
								height = 1500;
								width = Math.floor(aspectRatio2 * 1500);
								
								magikArgs.push(width);
							}
							
							magikArgs.push('-recolor', '.3 .1 .3 .3 .1 .3 .3 .1 .3', '-fill', 'rgba(0,0,0,0.05)');
							
							var signHeight = height / 5;
							var internsShadowCount = Math.floor(signHeight / 4);
							
							for (var i = internsShadowCount; i >= 0; i--) {
								magikArgs.push('-draw', 'rectangle 0, ' + (height / 2 - signHeight / 2 - i) + ', ' + width + ', ' + (height / 2 + signHeight / 2 + i));
							}
							
							magikArgs.push(
								'-gravity', 'South',
								'-font', 'OptimusPrinceps',
								'-fill', 'rgb(160,30,30)',
								'-stroke', 'black'
							);
							
							magikArgs.push('-pointsize', String(signHeight), '-draw', 'text 0,' + (height / 2 - signHeight * .5) + ' "YOU DIED"');
							
							magikArgs.push(fPathProcessed);
							
							var magik = spawn('convert', magikArgs);
							
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
							});
						} else {
							msg.reply('<internal pony error>');
						}
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
