
const http = require('https');
const unirest = DBot.js.unirest;
const JSON3 = DBot.js.json3;
const fs = DBot.js.fs;

DBot.CreateTagsSpace('derpibooru', [
	'anthro',
	'grimdark',
	'suggestive',
	'plot',
	'butt',
	'questionable',
	'explicit',
	'fuck',
	'cum',
	'cock',
	'dick',
]);

Util.mkdir(DBot.WebRoot + '/derpibooru', function() {
	Util.mkdir(DBot.WebRoot + '/derpibooru/search');
	Util.mkdir(DBot.WebRoot + '/derpibooru/image');
});

let GetImage = function(ID, callback) {
	let path = DBot.WebRoot + '/derpibooru/image/' + ID + '.json';
	
	fs.stat(path, function(err, stat) {
		if (stat) {
			fs.readFile(path, 'utf8', function(err, data) {
				if (data == '') {
					callback({}, ID, true);
					return;
				}
				
				callback(JSON3.parse(data), ID);
			});
		} else {
			unirest.get('https://trixiebooru.org/' + ID + '.json')
			.end(function(reply) {
				if (reply.status != 200) {
					callback({}, ID);
					return;
				}
				
				if (reply.raw_body == '') {
					callback({}, ID, true);
					fs.writeFile(path, '');
					return;
				}
				
				fs.writeFile(path, reply.raw_body);
				callback(reply.body, ID);
			});
		}
	});
}

let getRandomImage = function(callback) {
	let options = {
		host: 'trixiebooru.org',
		port: 443,
		protocol: 'https:',
		path: '/images/random',
	};
	
	let req = http.request(options, function(response) {
		let location = response.headers.location;
		let split = location.split('/');
		let myID = split[split.length - 1];
		
		GetImage(myID, callback);
	});
	
	req.on('error', function(err) {
		callback({}, -1);
	});
	
	req.end();
}

let bannedChars = [
	'||',
	'AND',
	'OR',
	'&&',
	'!',
	'NOT',
];

module.exports = {
	name: 'derpibooru',
	alias: ['pbooru', 'dbooru'],
	
	argNeeded: false,
	delay: 3,
	more: true,
	
	help_args: '[tags/image ID]',
	desc: 'Posts link to a image from derpibooru.\nIf no tags specified, posts a random image',
	
	func: function(args, cmd, msg, previousStuff) {
		let ServerTags;
		let ClientTags = DBot.UserTags(msg.author, 'derpibooru');
		let ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'derpibooru');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'derpibooru');
		}
		
		let num = Util.ToNumber(args[0]);
		
		if (!args[0]) {
			let tries = 0;
			
			let searchFunc;
			
			searchFunc = function() {
				tries++;
				
				if (tries >= 4) {
					msg.reply('Could not find an valid image. Maybe you or server banned most of valid tags');
					return;
				}
				
				getRandomImage(function(parse, myID) {
					if (myID == -1) {
						msg.reply('Derpibooru is down! Oh fuck.');
						return;
					}
					
					if (!parse || !parse.representations) {
						msg.reply('Derpibooru is down!');
						return;
					}
					
					let target = parse.representations.medium || parse.representations.small || parse.image;
					let itags = parse.tags;
					let split = itags.split(', ');
					
					for (let i in split) {
						if (!(msg.channel.name || 'private').match('nsfw') && (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i]))) {
							searchFunc();
							return;
						}
					}
					
					msg.reply('Tags: ' + itags + '\n<https://trixiebooru.org/' + myID +'>\nhttps:' + target);
				});
			}
			
			searchFunc();
		} else if (num) {
			GetImage(num, function(data, ID, isError) {
				if (isError) {
					msg.reply('Not a valid image ID!');
					return;
				}
				
				if (!data || !data.representations) {
					msg.reply('Derpibooru is down, or told me invalid phrase');
					return;
				}
				
				let target = data.representations.medium || data.representations.small || data.image;
				let itags = data.tags;
				let split = itags.split(', ');
				
				for (let i in split) {
					if (!(msg.channel.name || 'private').match('nsfw') && (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i]))) {
						msg.reply('Image have tags that was blocked by server, channel or even you ;n; Next tag was banned: ' + split[i]);
						return;
					}
				}
				
				msg.reply('Tags: ' + itags + '\n<https://trixiebooru.org/' + ID +'>\nhttps:' + target);
			});
		} else {
			let encode = '';
			let first = true;
			
			for (let i in args) {
				let str = args[i];
				
				for (let bk in bannedChars) {
					if (str.search(bannedChars[bk]) > 0) {
						msg.reply('Illegal charactets. AND, OR, NOT are also blocked');
						return;
					}
					
					if (!(msg.channel.name || 'private').match('nsfw') && (ClientTags.isBanned(str) || ServerTags && ServerTags.isBanned(str) || ChannelTags && ChannelTags.isBanned(str))) {
						msg.reply('You are trying to search by tag that was blocked by server, channel, or even you. Next tag was banned: ' + str);
						return;
					}
				}
				
				if (first) {
					first = false;
					encode = encodeURIComponent(str);
				} else {
					encode += ' AND ' + encodeURIComponent(str);
				}
			}
			
			let path = DBot.WebRoot + '/derpibooru/search/' + DBot.HashString(encode) + '.json';
			
			let continueLoad = function(parsed, isCached) {
				let valids = [];
				
				for (let k in parsed.search) {
					let data = parsed.search[k];
					let itags = data.tags;
					
					let split = itags.split(', ');
					let hit = false;
					
					for (let i in split) {
						if (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i])) {
							hit = true;
							break;
						}
					}
					
					if (!hit)
						valids.push(data);
				}
				
				if (!valids[0]) {
					if (isCached)
						msg.reply('(cached) Sorry, no results');
					else
						msg.reply('Sorry, no results');
					
					return;
				}
				
				let valids2;
				
				if (!previousStuff)
					valids2 = valids;
				else {
					valids2 = [];
					
					for (let i2 in valids) {
						let hit = false;
						
						for (let i in previousStuff) {
							if (previousStuff[i] == valids[i2].id) {
								hit = true;
								break;
							}
						}
						
						if (!hit)
							valids2.push(valids[i2]);
					}
				}
				
				if (!valids2[0]) {
					msg.reply('Oops! No more unique results!\nMight you want reset me by typing }derpibooru again?');
					return;
				}
				
				let data = DBot.RandomArray(valids2);
				let target = data.representations.medium || data.representations.small || data.image;
				
				if (previousStuff)
					previousStuff.push(data.id);
				
				if (isCached)
					msg.reply('(cached results)\nTags: ' + data.tags + '\n<https://trixiebooru.org/' + data.id + '>\nhttps:' + target);
				else
					msg.reply('Tags: ' + data.tags + '\n<https://trixiebooru.org/' + data.id + '>\nhttps:' + target);
			}
			
			fs.stat(path, function(err, stat) {
				if (stat && ((stat.ctime.getTime() / 1000) > (UnixStamp() - 3600))) {
					try {
						fs.readFile(path, 'utf8', function(err, data) {
							continueLoad(JSON3.parse(data), true);
						});
					} catch(err) {
						console.log(err);
						msg.reply('Uh oh, i broke for now');
					}
				} else {
					unirest.get('https://trixiebooru.org/search.json?q=' + encode)
					.end(function (response) {
						try {
							let parsed = response.body;
							if (!parsed) {
								msg.reply('Derpibooru is down! Onoh!');
								return;
							}
							
							continueLoad(parsed);
							fs.writeFile(path, response.raw_body);
						} catch(err) {
							console.log(err);
							msg.reply('Uh oh, i broke for now');
						}
					});
				}
			});
		}
	},
}
