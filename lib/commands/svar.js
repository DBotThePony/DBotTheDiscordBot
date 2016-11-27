
module.exports = {
	name: 'svar',
	
	help_args: '<cvar> [new value]',
	desc: 'Server Variable manipulation. If no value speciofied, prints it\'s value',
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM ;n;';
		
		if (!args[0]) {
			return 'There must be variable name' + Util.HighlightHelp(['svar'], 2, args);
		}
		
		var cvar = cvars.Server(msg.channel.guild).getVar(args[0]);
		
		if (!cvar) {
			return 'No such variable' + Util.HighlightHelp(['svar'], 2, args);
		}
		
		var isPrivate = cvar.haveFlag(FCVAR_PROTECTED);
		
		if (isPrivate && !msg.member.hasPermission('MANAGE_GUILD'))
			return 'Variable have `FCVAR_PROTECTED` flag and you don\'t have `MANAGE_GUILD` permissions! Uh oh! ;n;';
		
		if (args[1] === undefined) {
			if (isPrivate) {
				msg.author.sendMessage('```' + cvar.format() + '```');
			} else {
				msg.channel.sendMessage('```' + cvar.format() + '```');
			}
		} else {
			if (!msg.member.hasPermission('MANAGE_GUILD'))
				return 'You must have `MANAGE_GUILD` rights to set server variables';
			
			let trySet = cvar.setValue(args[1]);
			
			if (!trySet[0]) {
				msg.reply(cvars.ErrorMessages[trySet[1]]);
			} else {
				if (isPrivate) {
					msg.author.sendMessage('```Server variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
				} else {
					msg.channel.sendMessage('```Server variable "' + cvar.name + '" has changed to "' + cvar.getFormatedString() + '"```');
				}
			}
		}
	}
}