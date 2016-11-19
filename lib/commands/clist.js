
module.exports = {
	name: 'clist',
	alias: ['bannedcommands', 'bannedcomm', 'commbanlist', 'commbans'],
	
	help_args: '',
	desc: 'Prints banned commands on channel and server',
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg)) {
			return 'Onoh! This is PM channel!';
		}
		
		var cBans1 = DBot.ServerCBans(msg.channel.guild);
		var cBans2 = DBot.ChannelCBans(msg.channel);
		
		var output = '\nCommands banned on this server:\n';
		
		if (cBans1.bans[0]) {
			output += '```' + DBot.ConcatArray(cBans1.bans, ', ') + '```\n';
		} else {
			output += '<No bans>\n';
		}
		
		output += 'Commands banned on this channel:\n'
		
		if (cBans2.bans[0]) {
			output += '```' + DBot.ConcatArray(cBans2.bans, ', ') + '```\n';
		} else {
			output += '<No bans>\n';
		}
		
		return output;
	},
}