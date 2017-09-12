

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

'use strict';

const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

const spawn = require('child_process').spawn;
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/swirl');

module.exports = {
	name: 'swirl',
	
	allowUserArgument: true,
	delay: 10,
	
	help_args: '<url or user>',
	desc: 'WHOOOOSH',
	
	func: function(args, cmd, msg) {
		const url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'swirl', args, 1);
		
		const sha = String.hash(url);
		
		let fpath;
		const fpathProcessed = DBot.WebRoot + '/swirl/' + sha + '.gif';
		const fpathU = DBot.URLRoot + '/swirl/' + sha + '.gif';
		
		msg.channel.startTyping();
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			
			fs.stat(fpathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fpathU);
				} else {
					let magikArgs = ['-alpha', 'on', fpath, '-resize', '256x256>', '-background', 'none'];
					
					for (let amp = 0; amp < 900; amp += 50) {
						magikArgs.push(
							'(',
								'-clone', '0',
								'-swirl', amp,
							')'
						);
					}
					
					for (let amp = 900; amp >= 0; amp -= 50) {
						magikArgs.push(
							'(',
								'-clone', '0',
								'-swirl', amp,
							')'
						);
					}
					
					magikArgs.push(
						'-delay', '4',
						'-set', 'delay', '4',
						'-loop', '0',
						fpathProcessed
					);
					
					let magik = spawn('convert', magikArgs);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (code === 0) {
							msg.reply(fpathU);
						} else {
							msg.reply('I am cracked up ;w;');
						}
					});
				}
			});
		};
		
		CommandHelper.loadImage(url, function(newPath) {
			fpath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
};
