
/* global Postgres, sql, DBot */

const http = require('https');
const unirest = DBot.js.unirest;
const url = DBot.js.url;
const urlBase = 'www.trixiebooru.org';

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
	'dick'
]);

const checkRepresentations = ['thumb_tiny', 'thumb_small', 'thumb', 'small', 'medium', 'large', 'tall'];

const serealizeImageData = function(data) {
	for (const rep of checkRepresentations) {
		data.representations[rep] = data.representations[rep] || null;
	}
	
	data.updated_at = data.updated_at || null;
	
	return `('${data.id}', '${data.created_at}',' ${data.updated_at}',
'${data.upvotes}', '${data.downvotes}', '${data.faves}',
${sql.Array(data.tags.split(', '))}, '${data.representations.thumb_tiny}', '${data.representations.thumb_small}',
'${data.representations.thumb}', '${data.representations.small}', '${data.representations.medium}',
'${data.representations.large}', '${data.representations.tall}', '${data.representations.full}')`;
};

const GetImage = function(ID, callback) {
	Postgres.query('SELECT * FROM derpibooru_pics WHERE id = ' + ID, function(err, data) {
		if (data.empty()) {
			unirest.get('https://' + urlBase + '/' + ID + '.json')
			.end(function(reply) {
				if (reply.status !== 200) {
					callback({}, ID);
					return;
				}
				
				if (reply.raw_body === '') {
					callback({}, ID, true);
					return;
				}
				
				const data = reply.body;
				const insert = `INSERT INTO derpibooru_pics VALUES ${serealizeImageData(data)}`;
				data.small = data.representations.small;
				data.medium = data.representations.medium;
				data.large = data.representations.large;
				data.full = data.representations.full;
				
				Postgres.query(insert);
				callback(data, ID);
			});
		} else {
			callback(data.seek(), ID);
		}
	});
};

const searchImages = function(keywords, callback) {
	let encode;
	
	for (const str of keywords) {
		if (!encode) {
			encode = encodeURIComponent(str);
		} else {
			encode += ' AND ' + encodeURIComponent(str);
		}
	}
	
	const hash = String.hash(encode);
	
	Postgres.query(`SELECT stamp FROM derpibooru_search WHERE derpibooru_search.phrase = ` + Postgres.escape(hash), function(err, data) {
		data.throw();
		
		const getFunc = function() {
			unirest.get('https://' + urlBase + '/search.json?q=' + encode)
			.end(function(response) {
				try {
					let data = response.body;
					if (!data) {
						callback(null);
						return;
					}
					
					let images = [];
					let imagesArray = [];
					
					for (const im of data.search) {
						images.push(serealizeImageData(im));
						imagesArray.push(im.id);
						im.small = im.representations.small;
						im.medium = im.representations.medium;
						im.large = im.representations.large;
						im.full = im.representations.full;
					}
					
					Postgres.query(`INSERT INTO derpibooru_pics VALUES ${images.join(',')} ON CONFLICT (id) DO UPDATE
										SET upvotes = excluded.upvotes, downvotes = excluded.downvotes, faves = excluded.faves`, (err) => {
						if (err) throw err;
						
						Postgres.query(`INSERT INTO derpibooru_search VALUES ('${hash}', ${Math.floor(CurTime())}, ARRAY [${imagesArray.join(',')}]::INTEGER[]) ON CONFLICT (phrase) DO UPDATE SET stamp = excluded.stamp, pics = excluded.pics`, (err) => {
							if (err) throw err;
							callback(data.search);
						});
					});
				} catch(err) {
					console.log(err);
				}
			});
		};
		
		if (data.empty(getFunc)) return;
		const row = data.seek();
		if (row.stamp < (CurTime() - 3600)) {
			getFunc();
			return;
		}
		
		Postgres.query(`SELECT derpibooru_pics.* FROM derpibooru_pics, derpibooru_search WHERE derpibooru_search.phrase = ${Postgres.escape(hash)} AND derpibooru_pics.id = ANY(derpibooru_search.pics)`, (err, data) => {
			callback(data.rawRows);
		});
	});
};

const getRandomImage = function(callback) {
	let options = url.parse('https://' + urlBase + '/search?q=*&random_image=y.json');
	
	let req = http.request(options, function(response) {
		try {
			let location;
			
			for (let i in response.rawHeaders) {
				let opt = response.rawHeaders[i];
				
				if (opt === 'Location' || opt === 'location') {
					location = response.rawHeaders[Number(i) + 1];
					break;
				}
			}
			
			let split = location.split('/');
			let myID = split[split.length - 1];
			
			let split2 = myID.split('?');

			GetImage(split2[0], callback);
		} catch(err) {
			callback({}, -1);
		}
	});
	
	req.on('error', function(err) {
		callback({}, -1);
	});
	
	req.end();
};

let bannedChars = [
	'||',
	'AND',
	'OR',
	'&&',
	'!',
	'NOT'
];

module.exports = {
	name: 'derpibooru',
	alias: ['pbooru', 'dbooru', 'derpi'],
	
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
		
		let num = Number.from(args[0]);
		
		if (!args[0]) {
			let tries = 0;
			
			msg.channel.startTyping();
			
			let searchFunc;
			
			searchFunc = function() {
				if (msg.checkAbort()) return;
				tries++;
				
				if (tries >= 4) {
					msg.channel.stopTyping();
					msg.reply('Could not find an valid image. Maybe you or server banned most of valid tags');
					return;
				}
				
				getRandomImage(function(parse, myID) {
					if (msg.checkAbort()) return;
					if (myID === -1) {
						msg.channel.stopTyping();
						msg.reply('Derpibooru is down! Oh fuck.');
						return;
					}
					
					if (!parse) {
						msg.channel.stopTyping();
						msg.reply('Derpibooru is down!');
						return;
					}
					
					let target = parse.medium || parse.small || parse.full || parse.image;
					let split;
					
					if (typeof parse.tags === 'object')
						split = parse.tags;
					else
						split = parse.tags.split(', ');
					
					for (let i in split) {
						if (!(msg.channel.name || 'private').match('nsfw') && (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i]))) {
							searchFunc();
							return;
						}
					}
					
					msg.channel.stopTyping();
					msg.reply('Tags: ' + split.join(', ') + '\n<https://' + urlBase + '/' + myID +'>\nhttps:' + target);
				});
			};
			
			searchFunc();
		} else if (num) {
			if (msg.checkAbort()) return;
			msg.channel.startTyping();
			
			GetImage(num, function(data, ID, isError) {
				if (msg.checkAbort()) return;
				if (isError) {
					msg.channel.stopTyping();
					msg.reply('Not a valid image ID!');
					return;
				}
				
				if (!data) {
					msg.channel.stopTyping();
					msg.reply('Derpibooru is down, or told me invalid phrase');
					return;
				}
				
				let target = data.medium || data.small || data.full || data.image;
				let split;
				
				if (typeof data.tags === 'object')
					split = data.tags;
				else
					split = data.tags.split(', ');
				
				for (let i in split) {
					if (!(msg.channel.name || 'private').match('nsfw') && (ClientTags.isBanned(split[i]) || ServerTags && ServerTags.isBanned(split[i]) || ChannelTags && ChannelTags.isBanned(split[i]))) {
						msg.reply('Image have tags that was blocked by server, channel or even you ;n; Next tag was banned: ' + split[i]);
						msg.channel.stopTyping();
						return;
					}
				}
				
				msg.channel.stopTyping();
				msg.reply('Tags: ' + split.join(', ') + '\n<https://' + urlBase + '/' + ID +'>\nhttps:' + target);
			});
		} else {
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
			}
			
			msg.channel.startTyping();
			
			const continueLoad = function(parsed) {
				if (msg.checkAbort()) return;
				
				if (!parsed) {
					msg.channel.stopTyping();
					msg.reply('Derpibooru is down! Onoh!');
					return;
				}
				
				let valids = [];
				
				for (const data of parsed) {
					let split;
					
					if (typeof data.tags === 'object')
						split = data.tags;
					else
						split = data.tags.split(', ');
					
					let hit = false;
					
					for (const tag of split) {
						if (ClientTags.isBanned(tag) || ServerTags && ServerTags.isBanned(tag) || ChannelTags && ChannelTags.isBanned(tag)) {
							hit = true;
							break;
						}
					}
					
					if (!hit)
						valids.push(data);
				}
				
				if (!valids[0]) {
					msg.reply('Sorry, no results');
					msg.channel.stopTyping();
					
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
							if (previousStuff[i] === valids[i2].id) {
								hit = true;
								break;
							}
						}
						
						if (!hit)
							valids2.push(valids[i2]);
					}
				}
				
				if (!valids2[0]) {
					msg.channel.stopTyping();
					msg.reply('Oops! No more unique results!\nMight you want reset me by typing }derpibooru again?');
					return;
				}
				
				let data = Array.Random(valids2);
				let target = data.medium || data.small || data.full;
				
				if (previousStuff)
					previousStuff.push(data.id);
				
				msg.reply('Tags: ' + data.tags + '\n<https://' + urlBase + '/' + data.id + '>\nhttps:' + target);
				
				msg.channel.stopTyping();
			};
			
			searchImages(args, continueLoad);
		}
	}
};
