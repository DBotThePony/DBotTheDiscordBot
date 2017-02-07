
const fs = DBot.js.fs;
let AvaliablePonies = [];
let AvaliablePoniesPNG = [];

fs.readdir('./resource/poni_txt/', function(err, files) {
	files.forEach(function(file) {
		fs.readFile('./resource/poni_txt/' + file, 'utf8', function(err, data) {
			if (err) {
				console.error(err);
				return;
			}
			
			AvaliablePonies.push(data);
		});
	});
});

fs.readdir('./resource/poni/', function(err, files) {
	AvaliablePoniesPNG = files;
});

module.exports = {
	name: 'pony',
	alias: ['pone', 'ponie', 'poni', 'pne'],
	
	argNeeded: false,
	help_args: '',
	help_hide: true,
	desc: 'Ponies',
	delay: 10,
	
	func: function(args, cmd, msg) {
		let ponePNG = Array.Random(AvaliablePoniesPNG);
		
		fs.readFile('./resource/poni/' + ponePNG, {encoding: null}, function(err, data) {
			msg.channel.sendFile(data, ponePNG)
			.catch(function() {
				msg.channel.sendMessage('```' + Array.Random(AvaliablePonies.length) + '```');
			});
		});
	},
};
