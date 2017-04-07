

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
		
		url = url || CommandHelper.lastURL(msg.channel);
		if (!CommandHelper.checkURL(url))
			return DBot.CommandError('Invalid url maybe? ;w;', 'pixel', args, 1);
		
		let hash = String.hash(CurTime() + '_' + msg.channel.id);
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
		
		CommandHelper.loadImage(url, function(newPath) {
			fPath = newPath;
			ContinueFunc();
		}, function(result) {
			msg.channel.stopTyping();
			msg.reply('Failed to download image. "HTTP Status Code: ' + (result.code || 'socket hangs up or connection timeout') + '"');
		});
	}
}
