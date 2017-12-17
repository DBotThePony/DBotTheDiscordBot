

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

const child_process = require('child_process');
const spawn = child_process.spawn;
const fs = require('fs');

Util.mkdir(DBot.WebRoot + '/whodthis');

module.exports = {
	name: 'sepia',
	
	help_args: '<url>',
	desc: 'Edits image with sepia effect',
	allowUserArgument: true,
	delay: 5,
	
	func: function(args, cmd, msg) {
		const url = CommandHelper.CombinedURL(args[0], msg.channel);
		
		if (!url)
			return DBot.CommandError('Invalid url maybe? ;w;', 'sepia', args, 1);
		
		let fPath;
		const sha = String.hash(url);
		const fPathProcessed = DBot.WebRoot + '/whodthis/' + sha + '.png';
		const fPathProcessedURL = DBot.URLRoot + '/whodthis/' + sha + '.png';
		
		msg.channel.startTyping();
		
		const ContinueFunc = function() {
			if (msg.checkAbort()) return;
			
			fs.stat(fPathProcessed, function(err, stat) {
				if (msg.checkAbort()) return;
				
				if (stat) {
					msg.channel.stopTyping();
					msg.reply(fPathProcessedURL);
				} else {
					let magik = spawn('convert', [
						'-size', '1024x760', 'xc:black', '-size', '740x640', 'xc:white', '-gravity', 
						'center', '(', '-font', 'Roboto', '-pointsize', '72', '-draw', 
						'text 0,-260 "Who did this??!!" image srcover -310,-270 96,96 "./resource/emoji/1f602.png" image srcover 310,-270 96,96 "./resource/emoji/1f602.png"', ')',
						'-compose', 'srcover', '-composite',
						'(', '-size', '600x550', 'xc:none', '-compose', 'srcover', '-gravity', 'south',
						'(', fPath, '-resize', '460x460', ')', '-composite', ')',
						'-gravity', 'center', '-composite',
						fPathProcessed
					]);
					
					Util.Redirect(magik);
					
					magik.on('close', function(code) {
						msg.channel.stopTyping();
						
						if (!code) {
							msg.reply(fPathProcessedURL);
						} else {
							msg.reply('*squeak*');
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


