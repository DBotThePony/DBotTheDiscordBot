
const unirest = require('unirest');
const fs = require('fs');
const JSON3 = require('json3');
var token = '6RO3cAAWTFlIyOCsUVvuZkdNq8PpLAGR5fXaxIKbzUxs7PbWul';
var urlBase = 'https://api.tumblr.com/v2/blog/';

Util.mkdir(DBot.WebRoot + '/tumblr');

module.exports = {
	name: 'tumblr',
	
	more: true,
	argNeeded: true,
	failMessage: 'Missing blog name',
	
	help_args: '<blog>',
	desc: 'Posts a random post from specified blog',
	
	func: function(args, cmd, rawcmd, msg, previousStuff) {
		var sha = DBot.HashString(args[0]);
		var fpath = DBot.WebRoot + '/tumblr/' + sha + '.json';
		
		var continueFunc = function(data) {
			if (data.meta.status != 200) {
				msg.reply('Invalid blog');
				return;
			}
			
			var res = data.response;
			var posts = res.posts;
			
			if (!posts[0]) {
				msg.reply('Blog have no posts');
				return;
			}
			
			if (previousStuff) {
				var rand = Util.RandomArray(posts.filter(function(item) {
					return !Util.HasValue(previousStuff, item.id);
				}));
				
				if (!rand) {
					msg.reply('None of valid posts found because i listed them all.\nDo you want to reset search history by }retry ?');
					return
				}
				
				previousStuff.push(rand.id);
			} else {
				var rand = Util.RandomArray(posts);
			}
			
			var url = rand.post_url;
			var short_url = rand.short_url;
			var summary = rand.summary;
			var image_permalink = rand.image_permalink;
			var date = rand.date;
			var tags = rand.tags;
			
			var output = '\n<' + short_url + '>';
			
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