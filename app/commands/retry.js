
module.exports = {
	name: 'retry',
	
	help_hide: false,
	desc: 'Executes previous command',
	delay: -0.1,
	
	func: function(args, cmd, msg) {
		let cid = msg.channel.id;
		let uid = msg.author.id;
		if (!DBot.__LastRetryCommand[cid])
			DBot.__LastRetryCommand[cid] = {};
		
		if (!DBot.__LastRetryCommand[cid][uid])
			return 'There was no command before! ;w;';
		
		let data = DBot.__LastRetryCommand[cid][uid];
		let cCommand = data[0];
		let parsedArgs = data[1];
		let rawcmd = data[2];
		let moreArgs = data[3];
		let parsedHandlers = data[4];
		
		DBot.ExecuteCommand(cCommand, msg, parsedArgs, rawcmd, cCommand.id, moreArgs, parsedHandlers);
	},
};

