
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
	
	help_args: '<IP or hostname:port>',
	desc: 'Pings Source server',
	
	func: function(args, cmd, msg) {
		var port = 27015;
		var split = cmd.split(':');
		
		if (!split[0]) {
			return DBot.CommandError('Invalid IP', 'sping', args, 1);
		}
		
		var ip = split[0];
		var matchIP = ip.match(/([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)/);
		
		if (split[1]) {
			let portNum = Util.ToNumber(split[1]);
			
			if (!portNum) {
				return DBot.CommandError('Invalid port', 'sping', args, 1);
			} else {
				port = portNum;
			}
		}
		
		var continueFunc = function() {
			var randPort = Util.Random(50000, 55000);
			var Closed = false;
			var sendStamp;
			
			var socket = dgram.createSocket('udp4');
			
			socket.on('message', function(buf, rinfo) {
				try {
					var pingLatency = Math.floor((CurTime() - sendStamp) * 1000);
					var offset = 6;
					var readName = Util.ReadString(buf, offset);
					var name = readName[0];
					offset += readName[1];
					
					var readMap = Util.ReadString(buf, offset);
					var map = readMap[0];
					offset += readMap[1];
					
					var readFolder = Util.ReadString(buf, offset);
					var folder = readFolder[0];
					offset += readFolder[1];
					
					var readGame = Util.ReadString(buf, offset);
					var game = readGame[0];
					offset += readGame[1];
					
					var readID = buf.readUInt16LE(offset);
					offset += 2;
					
					var Players = buf.readUInt8(offset);
					offset += 1;
					
					var MPlayers = buf.readUInt8(offset);
					offset += 1;
					
					var Bots = buf.readUInt8(offset);
					offset += 1;
					
					var Type = String.fromCharCode(buf.readUInt8(offset));
					offset += 1;
					
					var OS = String.fromCharCode(buf.readUInt8(offset));
					offset += 1;
					
					var Visibility = buf.readUInt8(offset);
					offset += 1;
					
					var VAC = buf.readUInt8(offset);
					offset += 1;
					
					var readVersion = Util.ReadString(buf, offset);
					var Version = readVersion[0];
					offset += readVersion[1];
					
					var output = '\n```';
					
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
				msg.reply('OSHI~ Something is bad with UDP socket...');
			});
			
			socket.on('close', function() {
				Closed = true;
			});
			
			setTimeout(function() {
				if (Closed) {
					return;
				}
				
				msg.reply('Failed to ping: Connection timeout!');
				
				socket.close();
			}, 4000);
			
			socket.bind(randPort, '0.0.0.0');
		}
		
		if (matchIP) {
			continueFunc();
		} else {
			dns.lookup(ip, {family: 4, hints: dns.ADDRCONFIG | dns.V4MAPPED, all: false}, function(err, address) {
				if (err) {
					msg.reply('DNS Returned: `You have broken fingers. Wrong DNS name!`');
					return;
				}
				
				ip = address;
				continueFunc();
			});
		}
	},
}