
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
			let a = Util.ToNumber(matchIP[1]);
			let b = Util.ToNumber(matchIP[2]);
			let c = Util.ToNumber(matchIP[3]);
			let d = Util.ToNumber(matchIP[4]);
			
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
			
			dns.lookup(ip, {family: 4, hints: dns.ADDRCONFIG | dns.V4MAPPED, all: false}, function(err, address) {
				if (err) {
					msg.reply('DNS Returned: `You have broken fingers. Wrong DNS name!`');
					return;
				}
				
				ip = address;
				msg.channel.startTyping();
				continueFunc();
			});
		}
	},
}