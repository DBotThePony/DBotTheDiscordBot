
var AvaliablePonies = [];

DBot.fs.readdirSync('./lib/commands/ponies/').forEach(function(file) {
	DBot.fs.readFile('./lib/commands/ponies/' + file, 'utf8', function(err, data) {
		if (err) {
			console.error(err);
			return;
		}
		
		AvaliablePonies.push(data);
	});
});

module.exports = {
	name: 'pony',
	alias: ['pone', 'ponie', 'poni', 'pne'],
	
	argNeeded: false,
	help_args: '',
	help_hide: true,
	desc: 'Ponies',
	delay: 10,
	
	func: function(args, cmd, rawcmd, msg) {
		var get = '```' + AvaliablePonies[DBot.Random(0, AvaliablePonies.length - 1)] + '```';
		msg.reply(get);
		console.log(get);
	},
};
