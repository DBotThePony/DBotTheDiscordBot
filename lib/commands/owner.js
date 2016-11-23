
module.exports = {
	name: 'owner',
	
	help_args: '',
	desc: 'Prints owner of this server',
	
	func: function(args, cmd, rawcmd, msg) {
		if (DBot.IsPM(msg))
			return 'Onoh! It is PM! ;n;'
		
		return 'Owner of this server is: <@' + msg.channel.guild.ownerID + '>';
	}
}
