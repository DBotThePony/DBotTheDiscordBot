
const unirest = DBot.js.unirest;
const fs = DBot.js.fs;
const path = 'D:/www/derpco/bot/tomb';

let endPhrases = [
	'Rest in peace',
	'Died twice',
	'Dead in sphghetti never forgetti',
];

module.exports = {
	name: 'rip',
	
	argNeeded: true,
	failMessage: 'You need at least one argument',
	
	help_args: '<first> [second 0-3]',
	desc: 'Post a RIP',
	
	func: function(args, cmd, msg) {
		args[1] = args[1] || Array.Random(endPhrases);
		let bArgs = '';
		
		for (let i = 0; i < Math.min(args.length, 3); i++) {
			bArgs += '&top' + (i + 1) + '=' + encodeURIComponent(args[i]);
		}
		
		msg.channel.startTyping();
		
		let hash = String.hash(bArgs);
		let myPath = path + '/' + hash + '.jpg';
		let url = 'https://dbot.serealia.ca/bot/tomb/' + hash + '.jpg';
		
		fs.stat(myPath, function(err, stat) {
			if (stat) {
				msg.channel.stopTyping();
				msg.reply(url);
			} else {
				unirest.get('http://www.tombstonebuilder.com/generate.php?' + bArgs)
				.encoding(null)
				.end(function(result) {
					msg.channel.stopTyping();
					fs.writeFile(myPath, result.body);
					msg.reply(url);
				});
			}
		});
	},
}
