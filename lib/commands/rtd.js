
module.exports = {
	name: 'rtd',
	alias: ['roll'],
	
	help_args: '[amount of edges] [times]',
	desc: 'Rolls the dice!',
	
	func: function(args, cmd, rawcmd, msg) {
		var edges = Math.floor(Util.ToNumber(args[0]) || 6);
		var times = Math.floor(Util.ToNumber(args[1]) || 1);
		
		if (edges <= 1)
			return 'One edge? wot';
		
		if (times <= 0)
			return 'How can i throw it 0 times? 6.9';
		
		var rolls = [];
		
		for (var i = 1; i <= times; i++) {
			rolls.push(Util.Random(1, edges));
		}
		
		if (!DBot.IsPM(msg))
			msg.channel.sendMessage(msg.author + ' rolled: ' + Util.Concat(rolls, ', '));
		else
			msg.channel.sendMessage('Rolled: ' + Util.Concat(rolls, ', '));
	}
}
