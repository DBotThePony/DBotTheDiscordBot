
/* global DBot */

if (!DBot.cfg.tumblr_enable) return;

const unirest = DBot.js.unirest;
const fs = DBot.js.fs;
const JSON3 = DBot.js.json3;
const token = DBot.cfg.tumblr;
const urlBase = 'https://api.tumblr.com/v2/blog/';

Util.mkdir(DBot.WebRoot + '/tumblr');

module.exports = {
	name: 'tumblr',
	
	more: true,
	argNeeded: true,
	failMessage: 'Missing blog name',
	
	help_args: '<blog>',
	desc: 'Posts a random post from specified blog',
	
	func: function(args, cmd, msg, previousStuff) {
		let sha = DBot.HashString(args[0]);
		let fpath = DBot.WebRoot + '/tumblr/' + sha + '.json';
		
		msg.channel.startTyping();
		
		let continueFunc = function(data) {
			msg.channel.stopTyping();
			
			try {
				if (data.meta.status != 200) {
					msg.reply('Invalid blog');
					return;
				}
				
				let res = data.response;
				let posts = res.posts;
				
				if (!posts[0]) {
					msg.reply('Blog have no posts');
					return;
				}
				
				let rand;
				
				if (previousStuff) {
					rand = Util.RandomArray(posts.filter(function(item) {
						return !Util.HasValue(previousStuff, item.id);
					}));
					
					if (!rand) {
						msg.reply('None of valid posts found because i listed them all.\nDo you want to reset search history by }retry ?');
						return
					}
					
					previousStuff.push(rand.id);
				} else {
					rand = Util.RandomArray(posts);
				}
				
				let url = rand.post_url;
				let short_url = rand.short_url;
				let summary = rand.summary;
				let image_permalink = rand.image_permalink;
				let date = rand.date;
				let tags = rand.tags;
				let title = rand.title;
				
				let output = '\n<' + short_url + '>';
				
				if (image_permalink) {
					output += '\n' + image_permalink;
				}
				
				if (date) {
					output += '\nAt ' + date;
				}
				
				if (tags) {
					output += '\nTags: ' + tags.join(', ');
				}
				
				if (title && title != summary) {
					output += '\n' + title + '';
				}
				
				if (summary) {
					output += '\n```' + summary + '```';
				}
				
				msg.reply(output);
			} catch(err) {
				msg.reply('Uh oh ;n;');
				console.error(err);
			}
		}
		
		fs.stat(fpath, function(err, stat) {
			if (stat && ((stat.ctime.getTime() / 1000) > (UnixStamp() - 3600))) {
				fs.readFile(fpath, 'utf8', function(err, data) {
					continueFunc(JSON3.parse(data));
				});
			} else {
				unirest.get(urlBase + encodeURIComponent(args[0]) + '.tumblr.com/posts?api_key=' + token)
				.end(function(res) {
					continueFunc(res.body);
					fs.writeFile(fpath, res.raw_body);
				});
			}
		});
	},
}