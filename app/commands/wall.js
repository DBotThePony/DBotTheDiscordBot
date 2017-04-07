

// 
// Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
//  
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// 

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

Util.mkdir(DBot.WebRoot + '/wall');

module.exports = {
	name: 'wall',
	alias: ['iwall', 'flatspace'],
	
	help_args: '<url>',
	desc: 'Creates a small flat space out of image',
	allowUserArgument: true,
	delay: 10,
	
	func: function(args, cmd, msg) {
		let url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'wall', args, 1);
		
		let hash = String.hash(url);
		
		let fPath;
		
		const fPathProcessed = DBot.WebRoot + '/wall/' + hash + '.png';
		const fPathProcessedURL = DBot.URLRoot + '/wall/' + hash + '.png';
		
		msg.channel.startTyping();
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				if (stat && stat.isFile()) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', [
						'(',
							'-size', '128x128',
							'xc:black',
							'(', fPath,
							'-resize', '128', ')',
							'-compose', 'srcover',
							'-composite',
						')',
						'-virtual-pixel', 'tile',
						'-mattecolor', 'none',
						'-background', 'none',
						'-resize', '512x512!',
						'-distort', 'Perspective', '0,0,57,42  0,128,63,130  128,0,140,60  128,128,140,140',
						fPathProcessed
					]);

					Util.Redirect(magik);

					magik.on('close', function(code) {
						if (code === 0) {
							msg.channel.stopTyping();
							msg.reply(fPathProcessedURL);
						} else {
							msg.channel.stopTyping();
							msg.reply('Jump. Jump, Jump... *falls on the ground*');
						}
					});
				}
			});
		};
		
		CommandHelper.loadImage(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
};
