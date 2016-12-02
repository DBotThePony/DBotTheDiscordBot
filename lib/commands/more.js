
module.exports = {
	name: 'more',
	
	help_hide: false,
	desc: 'Retries previous **search related** command',
	delay: -0.1,
	
	func: function(args, cmd, msg) {
		var cid = msg.channel.id;
		var uid = msg.author.id;
		if (!DBot.__LastMoreCommand[cid])
			DBot.__LastMoreCommand[cid] = {};
		
		if (!DBot.__LastMoreCommand[cid][uid])
			return 'There was no search command before! ;n;';
		
		var data = DBot.__LastMoreCommand[cid][uid];
		var cCommand = data[0];
		var parsedArgs = data[1];
		var rawcmd = data[2];
		var moreArgs = data[3];
		var parsedHandlers = data[4];
		
		DBot.ExecuteCommand(cCommand, msg, parsedArgs, rawcmd, cCommand.id, moreArgs || [], parsedHandlers);
	},
};

