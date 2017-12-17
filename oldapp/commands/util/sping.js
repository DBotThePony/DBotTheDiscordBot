

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

const dgram = require('dgram');
const dns = require('dns');

const requestArray = [
	0xFF, 0xFF, 0xFF, 0xFF, 0x54,
	0x53, 0x6F, 0x75, 0x72, 0x63,
	0x65, 0x20, 0x45, 0x6E, 0x67,
	0x69, 0x6E, 0x65, 0x20, 0x51,
	0x75, 0x65, 0x72, 0x79, 0x00
];

const request = new Buffer.from(requestArray);

module.exports = {
	name: 'sping',
	alias: ['sourceping', 'pingsource', 'pings', 'cssping', 'pingcss', 'pingtf', 'pingtf2', 'tfping', 'tf2ping', 'csgoping', 'pingcsgo'],

	help_args: '<IP or hostname:port>',
	desc: 'Pings Source server',

	func: function(args, cmd, msg) {
		let port = 27015;
		let split = cmd.split(':');

		if (!split[0]) {
			return DBot.CommandError('Invalid IP', 'sping', args, 1);
		}

		let ip = split[0];
		let matchIP = ip.match(/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);

		if (split[1]) {
			let portNum = Number.from(split[1]);

			if (!portNum) {
				return DBot.CommandError('Invalid port', 'sping', args, 1);
			} else {
				port = portNum;
			}
		}

		let continueFunc = function() {
			if (msg.checkAbort()) return;
			let randPort = Math.Random(50000, 55000);
			let Closed = false;
			let sendStamp;

			let socket = dgram.createSocket('udp4');

			socket.on('message', function(buf, rinfo) {
				msg.channel.stopTyping();
				try {
					let pingLatency = Math.floor((CurTime() - sendStamp) * 1000);
					let offset = 6;
					let readName = Util.ReadString(buf, offset);
					let name = readName[0];
					offset += readName[1];

					let readMap = Util.ReadString(buf, offset);
					let map = readMap[0];
					offset += readMap[1];

					let readFolder = Util.ReadString(buf, offset);
					let folder = readFolder[0];
					offset += readFolder[1];

					let readGame = Util.ReadString(buf, offset);
					let game = readGame[0];
					offset += readGame[1];

					let readID = buf.readUInt16LE(offset);
					offset += 2;

					let Players = buf.readUInt8(offset);
					offset += 1;

					let MPlayers = buf.readUInt8(offset);
					offset += 1;

					let Bots = buf.readUInt8(offset);
					offset += 1;

					let Type = String.fromCharCode(buf.readUInt8(offset));
					offset += 1;

					let OS = String.fromCharCode(buf.readUInt8(offset));
					offset += 1;

					let Visibility = buf.readUInt8(offset);
					offset += 1;

					let VAC = buf.readUInt8(offset);
					offset += 1;

					let readVersion = Util.ReadString(buf, offset);
					let Version = readVersion[0];
					offset += readVersion[1];

					let output = '\n```';

					output += 'Ping to the server:      ' + Math.floor(pingLatency) + 'ms\n';
					output += 'Server IP:               ' + ip + '\n';
					output += 'Server Port:             ' + port + '\n';
					output += 'Server Name:             ' + name + '\n';
					output += 'Server current map:      ' + map + '\n';
					output += 'Server game folder:      ' + folder + '\n';
					output += 'Server game:             ' + game + '\n';
					output += 'Server game ID:          ' + readID + '\n';
					output += 'Server Current players:  ' + Players + '\n';
					output += 'Server Max players:      ' + MPlayers + '\n';
					output += 'Server Load:             ' + Players + '/' + MPlayers + ' (' + Math.floor(Players / MPlayers * 100) + '%)' + '\n';
					output += 'Server Bots:             ' + Bots + '\n';
					output += 'Server Type:             ' + (Type == 'd' && 'Dedicated' || Type == 'l' && 'Listen' || Type == 'p' && 'SourceTV' || 'WTF?') + '\n';
					output += 'Server OS:               ' + (OS == 'l' && 'Linux' || OS == 'w' && 'Windows' || OS == 'm' && 'Apple OS/X' || OS == 'o' && 'Apple OS/X' || 'WTF?') + '\n';
					output += 'Server is running VAC:   ' + (VAC == 1 && 'Yes' || 'Nope') + '\n';

					output += '\n```';

					msg.reply(output);
				} catch(err) {
					console.log(err);
					msg.reply('<internal pony error>');
				}

				socket.close();
			});

			socket.on('listening', function() {
				socket.send(request, 0, request.length, port, ip);
				sendStamp = CurTime();
			});

			socket.on('error', function(err) {
				console.error(err);
				msg.channel.stopTyping();
				msg.reply('OSHI~ Something is bad with UDP socket...');
			});

			socket.on('close', function() {
				Closed = true;
			});

			setTimeout(function() {
				if (Closed) {
					return;
				}

				msg.channel.stopTyping();
				msg.reply('Failed to ping: Connection timeout!');

				socket.close();
			}, 4000);

			socket.bind(randPort, '0.0.0.0');
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
				return DBot.CommandError('Invalid IP', 'sping', args, 1);
			}

			msg.channel.startTyping();
			continueFunc();
		} else {
			msg.channel.startTyping();
			dns.lookup(ip, {family: 4, hints: dns.ADDRCONFIG | dns.V4MAPPED, all: false}, function(err, address) {
				if (err) {
					msg.channel.stopTyping();
					msg.reply('DNS Returned: "You have broken fingers. Wrong DNS name!"');
					return;
				}

				ip = address;
				continueFunc();
			});
		}
	},
}