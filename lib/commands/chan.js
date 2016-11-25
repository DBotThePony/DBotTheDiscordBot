
var Boards = [
	["/a/", "Anime & Manga"],
	["/c/", "Anime/Cute"],
	["/w/", "Anime/Wallpapers"],
	["/m/", "Mecha"],
	["/cgl/", "Cosplay & EGL"],
	["/cm/", "Cute/Male"],
	["/f/", "Flash"],
	["/n/", "Transportation"],
	["/jp/", "Otaku Culture"],
	["/v/", "Video Games"],
	["/vg/", "Video Game Generals"],
	["/vp/", "Pokemon"],
	["/vr/", "Retro Games"],
	["/co/", "Comics & Cartoons"],
	["/g/", "Technology"],
	["/tv/", "Television & Film"],
	["/k/", "Weapons"],
	["/o/", "Auto"],
	["/an/", "Animals & Nature"],
	["/tg/", "Traditional Games"],
	["/sp/", "Sports"],
	["/asp/", "Alternative Sports"],
	["/sci/", "Science & Math"],
	["/his/", "History & Humanities"],
	["/int/", "International"],
	["/out/", "Outdoors"],
	["/toy/", "Toys"],
	["/i/", "Oekaki"],
	["/po/", "Papercraft & Origami"],
	["/p/", "Photography"],
	["/ck/", "Food & Cooking"],
	["/ic/", "Artwork/Critique"],
	["/wg/", "Wallpapers/General"],
	["/lit/", "Literature"],
	["/mu/", "Music"],
	["/fa/", "Fashion"],
	["/3/", "3DCG"],
	["/gd/", "Graphic Design"],
	["/diy/", "Do-It-Yourself"],
	["/wsg/", "Worksafe GIF"],
	["/qst/", "Quests"],
	["/biz/", "Business & Finance"],
	["/trv/", "Travel"],
	["/fit/", "Fitness"],
	["/x/", "Paranormal"],
	["/adv/", "Advice"],
	["/lgbt/", "LGBT"],
	["/mlp/", "Pony"],
	["/news/", "Current News"],
	["/wsr/", "Worksafe Requests"],
	["/vip/", "Very Important Posts"],
];

var nsfwBoard = [
	["/b/", "Random"],
	["/r9k/", "ROBOT9001"],
	["/pol/", "Politically Incorrect"],
	["/soc/", "Cams & Meetups"],
	["/s4s/", "Shit 4chan Says"],
	["/s/", "Sexy Beautiful Women"],
	["/hc/", "Hardcore"],
	["/hm/", "Handsome Men"],
	["/h/", "Hentai"],
	["/e/", "Ecchi"],
	["/u/", "Yuri"],
	["/d/", "Hentai/Alternative"],
	["/y/", "Yaoi"],
	["/t/", "Torrents"],
	["/hr/", "High Resolution"],
	["/gif/", "Adult GIF"],
	["/aco/", "Adult Cartoons"],
	["/r/", "Adult Requests"],
];

var validBoards = [];
var defBans = [];
var fs = require('fs');
var JSON3 = require('json3');
var unirest = require('unirest');

for (var i in Boards) {
	var brd = Boards[i][0];
	
	validBoards.push(brd.substr(1, brd.length - 2));
}

for (var i in nsfwBoard) {
	var brd = nsfwBoard[i][0];
	
	validBoards.push(brd.substr(1, brd.length - 2));
	defBans.push(brd.substr(1, brd.length - 2));
}

DBot.CreateTagsSpace('4chan', defBans);

fs.stat(DBot.WebRoot + '/4chan', function(err, stat) {
	if (!stat)
		fs.mkdirSync(DBot.WebRoot + '/4chan');
});

var ClearPostChars = function(str) {
	var exp = new RegExp('<br>', 'g');
	var exp2 = new RegExp('<[^>]*>', 'g');
	
	str = str.replace(exp, '\n');
	str = str.replace(exp2, '');
	str = str.replace(new RegExp('&gt;', 'g'), '>');
	str = str.replace(new RegExp('&#039;', 'g'), '\'');
	
	return str;
}

module.exports = {
	name: 'chan',
	alias: ['4chan'],
	
	help_args: '[board]',
	desc: 'Posts a random message from selected board.\nIf no board specified, random SFW board will be selected',
	
	func: function(args, cmd, rawcmd, msg) {
		args[0] = args[0] || DBot.RandomArray(Boards)[0];
		var board = args[0];
		board = board.toLowerCase();
		
		if (board.substr(0, 1) == '/') {
			board = board.substr(1);
		}
		
		if (board.substr(board.length - 1) == '/') {
			board = board.substr(0, board.length - 1);
		}
		
		var hit = false;
		
		for (var i in validBoards) {
			if (board == validBoards[i]) {
				hit = true;
				break;
			}
		}
		
		if (!hit)
			return 'Invalid board! 6.9';
		
		var ServerTags;
		var ClientTags = DBot.UserTags(msg.author, 'derpibooru');
		var ChannelTags;
		
		if (!DBot.IsPM(msg)) {
			ChannelTags = DBot.ChannelTags(msg.channel, 'derpibooru');
			ServerTags = DBot.ServerTags(msg.channel.guild, 'derpibooru');
		}
		
		if (msg.channel.name != 'nsfw' && (ClientTags.isBanned(board) || ServerTags && ServerTags.isBanned(board) || ChannelTags && ChannelTags.isBanned(board)))
			return 'Board is banned by the server, channel or even you';
		
		var ContinueLoad = function(data) {
			try {
				var validReplies = [];
				
				for (var i in data.threads) {
					var thread = data.threads[i];
					
					var imgID = thread.posts[0].tim;
					var imgEXT = thread.posts[0].ext;
					var threadPost = thread.posts[0].no;
					
					for (var i2 in thread.posts) {
						var post = thread.posts[i2];
						var text = post.com;
						var id = post.no;
						
						if (id && text && text.length < 1000) {
							validReplies.push([text, id, imgID, imgEXT, threadPost]);
						}
					}
				}
				
				var rand = DBot.RandomArray(validReplies);
				
				if (!rand) {
					msg.reply('No valid posts found ;n;');
					return;
				}
				
				var text = ClearPostChars(rand[0]);
				var reply = 'Board: /' + board + '/';
				
				reply += '\nhttps://i.4cdn.org/' + board + '/' + rand[2] + rand[3] + '\n';
				
				reply += '```Post #' + rand[1];
				
				reply += '\n' + text + '```';
				
				msg.reply(reply);
			} catch(err) {
				msg.reply('<internal beep boop error u_u>');
				console.error(err);
			}
		}
		
		var path = DBot.WebRoot + '/4chan/' + board + '.json';
		
		fs.stat(path, function(err, stat) {
			if (stat && ((stat.ctime.getTime() / 1000) > (UnixStamp() - 3600))) {
				fs.readFile(path, 'utf8', function(err, data) {
					ContinueLoad(JSON3.parse(data));
				});
			} else {
				unirest.get('http://api.4chan.org/' + board + '/1.json')
				.end(function(reply) {
					fs.writeFile(path, reply.raw_body);
					ContinueLoad(reply.body);
				});
			}
		});
	},
}

DBot.RegisterCommand({
	name: 'chanboards',
	alias: ['4chanboards', 'chanboard', '4chanboards'],
	
	help_args: '',
	desc: 'Lists valid boards',
	
	func: function(args, cmd, rawcmd, msg) {
		var build = '';
		
		for (var i in Boards) {
			build += Boards[i][0] + ' - ' + Boards[i][1] + '\n';
		}
		
		msg.author.sendMessage('Boards: \n```' + build + '```');
		
		if (!DBot.IsPM(msg))
			return 'Look into your PM';
	}
});
