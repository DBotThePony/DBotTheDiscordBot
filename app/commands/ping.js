
let initMessage = [
	'Bleh', 'Pne?', 'Ponies are coming for you', 'Ponis everiwhere!', 'gnignip', 'k', 'Am I a bot?',
	'It is so fun!', 'Lookin\' for something interesting', '*Jumps*', 'pew pew', 'vroom'
];

let finishMessage = [
	'this server', 'equestrian bunkers', 'dimension portal controller', 'factories', 'russian botnet',
	'pony PC botnet', 'your PC', 'your Router', 'NSA', 'Mars', 'laboratories', 'bad humans jail',
	'the Machine', 'skynet prototype', 'Russia', 'USA nuclear bombs timer', 'Discord status server',
	'burning fire', 'Google DNS', 'leafletjs.com maps', 'GitLab', 'not working GitHub', 'NotSoSuper',
	'DBot', 'a cat', 'Java application', 'british secret bases', 'China supercomputers', '\\n',
	'your code', 'cake', 'NotSoBot', 'command', 'trap music DJ', 'localhost', '127.0.0.1', '127.199.199.1',
	'meow', 'hacked Miecraft server', 'GMod updates', 'isitdownrightnow.com', 'Google AI', 'Samsung smartphone',
	'memeland', 'block cutting machine', 'HAYO PRODUCTIONS!', 'SCP-173'
];

module.exports = {
	name: 'ping',
	
	help_args: '',
	desc: 'Prints how much time it takes to post a message for me',
	
	func: function(args, cmd, msg) {
		let stamp = CurTime();
		
		msg.sendMessage(Array.Random(initMessage))
		.then(function(nmsg) {
			let newTime = CurTime();
			let delta = newTime - stamp;
			
			if (cmd)
				nmsg.edit('It takes *' + Math.floor(delta * 1000) + '* milliseconds to ping **' + Util.nonParsedText(cmd) + '**');
			else
				nmsg.edit('It takes *' + Math.floor(delta * 1000) + '* milliseconds to ping **' + Array.Random(finishMessage) + '**');
		});
	},
}