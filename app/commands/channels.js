
module.exports = {
	name: 'channels',
	alias: ['channellist', 'channelist'],
	
	help_args: '',
	desc: 'Lists all channels on current server',
	
	func: function(args, cmd, msg) {
		if (DBot.IsPM(msg))
			return 'PM? ;w;';
		
		let reply = '```\n';
		let channels = msg.channel.guild.channels.array();
		
		for (let channel of channels) {
			reply += channel.id + ' (' + DBot.GetChannelID(channel) + ') --- #' + channel.name + '\n';
		}
		
		reply += '```';
		
		return reply;
	}
}
