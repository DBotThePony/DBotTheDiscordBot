
module.exports = {
	name: 'rtd',
	alias: ['roll'],
	
	help_args: '[amount of edges] [times]',
	desc: 'Rolls the dice!',
	
	func: function(args, cmd, msg) {
		let edges = Math.floor(Util.ToNumber(args[0]) || 6);
		let times = Math.floor(Util.ToNumber(args[1]) || 1);
		
		if (edges <= 1)
			return 'One edge? wot';
		
		if (edges > 100)
			edges = 100;
		
		if (times <= 0)
			return 'How can i throw it 0 times? 6.9';
		
		if (times > 10)
			times = 10;
		
		let rolls = [];
		
		for (let i = 1; i <= times; i++) {
			rolls.push(Util.Random(1, edges));
		}
		
		if (!DBot.IsPM(msg))
			msg.channel.sendMessage(msg.author + ' rolled: ' + Util.Concat(rolls, ', '));
		else
			msg.channel.sendMessage('Rolled: ' + Util.Concat(rolls, ', '));
	}
}
