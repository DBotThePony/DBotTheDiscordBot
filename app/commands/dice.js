
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/dice');
Util.mkdir(DBot.WebRoot + '/multi');
Util.mkdir(DBot.WebRoot + '/maze');

module.exports = {
	name: 'dice',
	
	help_args: '<url>',
	desc: 'Brust an image',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'dice', args, 1);
		
		let hash = String.hash(CurTime() + '_' + msg.channel.id);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		let tmpFileDice = DBot.WebRoot + '/dice/' + hash + '_tmp_dice.miff';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			if (msg.checkAbort()) return;
			IMagick.Identify(fPath, function(err, ftype, width, height) {
				if (msg.checkAbort()) return;
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				let size = Math.min(Math.ceil(width * .1), Math.ceil(height * .1));
				
				let fragmentsW = Math.ceil(width / size);
				let fragmentsH = Math.ceil(height / size);
				let total = fragmentsW * fragmentsH;
				
				let magik = spawn('convert', ['-quiet', fPath, '-crop', size + 'x' + size, tmpFileDice]);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (msg.checkAbort()) return;
					if (code != 0) {
						msg.channel.stopTyping();
						msg.reply('*falls on the ground and squeaks*');
						return;
					}
					
					let magikArgs = ['-background', 'none', '-tile', fragmentsW + 'x' + fragmentsH, '-geometry', '+0+0'];
					
					for (let i = 0; i < total; i++) {
						let rand = Math.Random(-2, 2);
						magikArgs.push('(', tmpFileDice + '[' + i + ']', '-rotate', rand * 90, ')')
					}
					
					magikArgs.push(fPathProcessed);
					let magik = spawn('montage', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						if (msg.checkAbort()) return;
						msg.channel.stopTyping();
						if (code != 0) {
							msg.reply('*falls on the ground and squeaks*');
							return;
						}
						
						msg.reply(fPathProcessedURL);
						fs.unlink(tmpFileDice, function(err) {
							if (err)
								console.error(err);
						});
					});
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

DBot.RegisterCommand({
	name: 'scramble',
	
	help_args: '<url>',
	desc: 'Similar to dice, but scrambles parts',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'scramble', args, 1);
		
		let hash = String.hash(CurTime() + '_2_' + msg.channel.id);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		let tmpFileDice = DBot.WebRoot + '/dice/' + hash + '_tmp_dice.miff';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			IMagick.Identify(fPath, function(err, ftype, width, height) {
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				let size = Math.min(Math.ceil(width * .1), Math.ceil(height * .1));
				
				let fragmentsW = Math.ceil(width / size);
				let fragmentsH = Math.ceil(height / size);
				let total = fragmentsW * fragmentsH;
				let left = [];
				
				for (let i = 0; i < total; i++)
					left.push(i);
				
				let magik = spawn('convert', ['-quiet', fPath, '-crop', size + 'x' + size, tmpFileDice]);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code != 0) {
						msg.channel.stopTyping();
						msg.reply('*falls on the ground and squeaks*');
						return;
					}
					
					let magikArgs = ['-background', 'none', '-tile', fragmentsW + 'x' + fragmentsH, '-geometry', '+0+0'];
					
					for (let i = 0; i < total; i++) {
						let r = Math.Random(0, left.length - 1);
						let slice = left[r];
						left.splice(r, 1);
						
						let rand = Math.Random(-2, 2);
						magikArgs.push('(', tmpFileDice + '[' + slice + ']', '-rotate', rand * 90, ')')
					}
					
					magikArgs.push(fPathProcessed);
					let magik = spawn('montage', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						if (code != 0) {
							msg.reply('*falls on the ground and squeaks*');
							return;
						}
						
						msg.reply(fPathProcessedURL);
						fs.unlink(tmpFileDice, function(err) {
							if (err)
								console.error(err);
						});
					});
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
});

DBot.RegisterCommand({
	name: 'scramble2',
	
	help_args: '<url>',
	desc: 'Similar to dice, but scrambles parts without rotating them',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'scramble2', args, 1);
		
		let hash = String.hash(CurTime() + '_2_' + msg.channel.id);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/dice/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/dice/' + hash + '.png';
		let tmpFileDice = DBot.WebRoot + '/dice/' + hash + '_tmp_dice.miff';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			IMagick.Identify(fPath, function(err, ftype, width, height) {
				if (err) {
					msg.channel.stopTyping();
					console.error(err);
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				let size = Math.min(Math.ceil(width * .1), Math.ceil(height * .1));
				
				let fragmentsW = Math.ceil(width / size);
				let fragmentsH = Math.ceil(height / size);
				let total = fragmentsW * fragmentsH;
				let left = [];
				
				for (let i = 0; i < total; i++)
					left.push(i);
				
				let magik = spawn('convert', ['-quiet', fPath, '-crop', size + 'x' + size, tmpFileDice]);
				
				Util.Redirect(magik);
				
				magik.on('close', function(code) {
					if (code != 0) {
						msg.channel.stopTyping();
						msg.reply('*falls on the ground and squeaks*');
						return;
					}
					
					let magikArgs = ['-background', 'none', '-tile', fragmentsW + 'x' + fragmentsH, '-geometry', '+0+0'];
					
					for (let i = 0; i < total; i++) {
						let r = Math.Random(0, left.length - 1);
						let slice = left[r];
						left.splice(r, 1);
						
						magikArgs.push(tmpFileDice + '[' + slice + ']')
					}
					
					magikArgs.push(fPathProcessed);
					let magik = spawn('montage', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						if (code != 0) {
							msg.reply('*falls on the ground and squeaks*');
							return;
						}
						
						msg.reply(fPathProcessedURL);
						fs.unlink(tmpFileDice, function(err) {
							if (err)
								console.error(err);
						});
					});
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
});

DBot.RegisterCommand({
	name: 'multi',
	alias: ['multiply', 'multilayer', 'theyareeverywhere'],
	
	help_args: '<url>',
	desc: 'Rotate image much times',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		const url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'multi', args, 1);
		
		const hash = String.hash(CurTime() + '_' + msg.channel.id);
		let fPath;
		
		const fPathProcessed = DBot.WebRoot + '/multi/' + hash + '.png';
		const fPathProcessedURL = DBot.URLRoot + '/multi/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			let magikArgs = ['-background', 'none',
				'-tile', '20x20',
				'-geometry', '+0+0',
				'(',
					'-size', '100x100',
					'xc:black',
					'-gravity', 'center',
					fPath,
					'-resize', '100x100',
					
					'-compose', 'srcover',
					'-composite',
				')'
			];
			
			for (let i = 0; i <= 400; i++) {
				let rand = Math.Random(-2, 2);
				magikArgs.push('(', '-clone', '0', '-rotate', rand * 90, ')')
			}
			
			magikArgs.push('-delete', '0', '-delete', '0', fPathProcessed);
			let magik = spawn('montage', magikArgs);
			
			Util.Redirect(magik);
			
			magik.on('close', function(code) {
				msg.channel.stopTyping();
				
				if (code != 0) {
					msg.reply('*falls on the ground and squeaks*');
					return;
				}
				
				msg.reply(fPathProcessedURL);
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

/*

-- Ugh

local output = {}
local size = 10
local div = size / 2

for row = 1, size do
	output[row] = {}
end

for top = 1, size do
	local build = ''
	
	if top < div then
		for len = 1, size - 2 do
			local delta = top - len
			local rdelta = size - 1 - (top + len)
			
			if len < div then
				if delta > 0 and delta > div then
					build = build .. '-1, '
				elseif delta <= 0 then
					build = build .. '0,  '
				else
					build = build .. '-1, '
				end
			else
				if rdelta > 0 and rdelta > div then
					build = build .. '0,  '
				elseif rdelta <= 0 then
					build = build .. '1,  '
				else
					build = build .. '0,  '
				end
			end
		end
	else
		for len = 1, size - 2 do
			local delta = size - top - len
			local rdelta = size - 1 - (size - top + len)
			
			if len < div then
				if delta > 0 and delta > div then
					build = build .. '-1, '
				elseif delta <= 0 then
					build = build .. '-2, '
				else
					build = build .. '-1, '
				end
			else
				if rdelta > 0 and rdelta > div then
					build = build .. '0,  '
				elseif rdelta <= 0 then
					build = build .. '1,  '
				else
					build = build .. '-2, '
				end
			end
		end
	end
	
	print(build)
end

*/

let rotateMatrix = [
-1,  0,  0,  0,  0,  0,  0,  0,  0,  1,
-1, -1,  0,  0,  0,  0,  0,  0,  1,  1,
-1, -1, -1,  0,  0,  0,  0,  1,  1,  1,
-1, -1, -1, -1,  0,  0,  1,  1,  1,  1,
-1, -1, -1, -1,  0,  1,  1,  1,  1,  1,
-1, -1, -1, -1, -2,  1,  1,  1,  1,  1,
-1, -1, -1, -2, -2, -2,  1,  1,  1,  1,
-1, -1, -2, -2, -2, -2, -2,  1,  1,  1,
-1, -2, -2, -2, -2, -2, -2, -2,  1,  1,
-2, -2, -2, -2, -2, -2, -2, -2, -2,  1,
];

DBot.RegisterCommand({
	name: 'spinned',
	alias: ['pyramid', 'pyrmid'],
	
	help_args: '<url>',
	desc: 'Maze. Spooky.',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'spinned', args, 1);
		
		let hash = String.hash(url);
		let fPath;
		
		let fPathProcessed = DBot.WebRoot + '/maze/' + hash + '.png';
		let fPathProcessedURL = DBot.URLRoot + '/maze/' + hash + '.png';
		
		msg.channel.startTyping();
		
		let ContinueFunc = function() {
			fs.stat(fPathProcessed, function(err, stat) {
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magikArgs = ['-background', 'none', '-tile', '10x10', '-geometry', '+0+0', '(', fPath, '-resize', '500x500>', ')'];
					
					for (let rotate of rotateMatrix) {
						magikArgs.push('(', '-clone', '0', '-rotate', rotate * 90, ')')
					}
					
					magikArgs.push('-delete', '0', fPathProcessed);
					let magik = spawn('montage', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code != 0) {
							msg.reply('*falls on the ground and squeaks*');
							return;
						}
						
						msg.reply(fPathProcessedURL);
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
