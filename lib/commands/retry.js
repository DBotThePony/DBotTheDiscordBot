
module.exports = {
	name: 'retry',
	
	help_hide: false,
	desc: 'Executes previous command',
	delay: -0.1,
	
	func: function(args, cmd, rawcmd, msg) {
		var cid = msg.channel.id;
		var uid = msg.author.id;
		if (!DBot.__LastRetryCommand[cid])
			DBot.__LastRetryCommand[cid] = {};
		
		if (!DBot.__LastRetryCommand[cid][uid])
			return 'There was no command before! ;w;';
		
		var data = DBot.__LastRetryCommand[cid][uid];
		var cCommand = data[0];
		var parsedArgs = data[1];
		var rawcmd = data[2];
		var rawmessage = data[3];
		var moreArgs = data[4];
		
		DBot.ExecuteCommand(cCommand, msg, parsedArgs, rawcmd, cCommand.id, rawmessage, moreArgs);
	},
};

