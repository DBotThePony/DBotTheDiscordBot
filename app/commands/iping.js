

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

const ping = require('ping');
const dns = require('dns');

const protocol = new RegExp('^[a-z]://', 'gi');
const address = new RegExp('/', 'gi');

module.exports = {
	name: 'iping',
	alias: ['icmp'],
	
	help_args: '<IP or hostname>',
	desc: 'Pings server using ICMP protocol',
	
	func: function(args, cmd, msg) {
		if (!args[0])
			return DBot.CommandError('Invalid IP', 'iping', args, 1);
		
		let ip = args[0];
		let matchIP = ip.match(/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
		
		let continueFunc = function() {
			if (msg.checkAbort()) return;
			let stamp = CurTime();
			
			ping.promise.probe(ip)
			.then(function(data) {
				msg.channel.stopTyping();
				
				if (!data.alive) {
					msg.reply(ip + ' is DEAD');
					return;
				}
				
				let stamp2 = CurTime();
				let ms = stamp2 - stamp;
				
				msg.reply(ip + ' is alive. Ping is about ' + Math.floor(ms * 1000) + 'ms');
			});
		}
		
		if (matchIP) {
			let a = Number.from(matchIP[1]);
			let b = Number.from(matchIP[2]);
			let c = Number.from(matchIP[3]);
			let d = Number.from(matchIP[4]);
			
			let cond = !a || !b || !c || !d ||
				a < 1 || a > 255 ||
				b < 1 || b > 255 ||
				c < 1 || c > 255 ||
				d < 1 || d > 255;
			
			if (cond) {
				return DBot.CommandError('Invalid IP', 'iping', args, 1);
			}
			
			msg.channel.startTyping();
			continueFunc();
		} else {
			if (ip.match(protocol))
				return DBot.CommandError('As i can stroke address with my hoof, i see there are a protocol', 'iping', args, 1);
			
			if (ip.match(address))
				return DBot.CommandError('As i can stroke address with my hoof, i see there are a path', 'iping', args, 1);
			
			msg.channel.startTyping();
			dns.lookup(ip, {family: 4, hints: dns.ADDRCONFIG | dns.V4MAPPED, all: false}, function(err, address) {
				if (err) {
					msg.reply('DNS Returned: "You have broken fingers. Wrong DNS name!"');
					msg.channel.stopTyping();
					return;
				}
				
				ip = address;
				continueFunc();
			});
		}
	},
}