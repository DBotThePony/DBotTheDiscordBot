
const myGlobals = require('../globals.js');
const hook = myGlobals.hook;
const DBot = myGlobals.DBot;
const sql = myGlobals.sql;
const IMagick = myGlobals.IMagick;
const Util = myGlobals.Util;
const cvars = myGlobals.cvars;
const Postgres = myGlobals.Postgres;
const CommandHelper = myGlobals.CommandHelper;

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
