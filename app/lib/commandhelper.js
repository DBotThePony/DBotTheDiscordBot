
/* global DBot */

const imageExt = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|webp)(\?|\/)?/i;
const imageExtExt = /\.(png|jpeg|jpg|tif|tiff|bmp|svg|psd|gif|webp)(\?|\/)?/i;
const expr = new RegExp('^https?://' + DBot.URLRootBare + '/(.*)');
const cover = new RegExp('\\.\\./', 'gi');
const cover2 = new RegExp('\\./', 'gi');
const insideBotFolder = new RegExp('^\\./resource/', '');

DBot.ExtraxtExt = function(url) {
	return url.match(imageExtExt)[1];
};

const CommandHelper = {
	switchImageArgs: function(channel, args, defNum) {
		const num1 = Number.from(args[0]);
		const num2 = Number.from(args[1]);
		const url1 = CommandHelper.CombinedURL(args[0], channel);
		const url2 = CommandHelper.CombinedURL(args[1], channel);
		
		if (num1 === undefined && num2 === undefined) {
			num1 = defNum;
			num2 = defNum;
		}
		
		if (num1 !== undefined && url2 !== undefined) {
			return [num1, url2];
		} else if (num2 !== undefined && url1 !== undefined) {
			return [num2, url1];
		} else {
			return [defNum, null];
		} 
	},
	
	CombinedURL2: function(url, channel) {
		if (typeof(url) === 'object') {
			url = url.avatarURL;

			if (!url)
				return false;
		}

		url = url || DBot.LastURLImageInChannel2(channel);

		if (!url)
			return false;

		if (url.match(cover) || url.match(cover2) || url.match(/^\//))
			return false;

		if (!DBot.CheckURLImage2(url)) {
			let emojiMatch = url.match(DBot.emojiRegExpWeak);

			if (!emojiMatch)
				return false;
			else
				return DBot.FindEmojiURL(url);
		}

		return url;
	},
	
	CombinedURL: function(url, channel) {
		if (typeof(url) === 'object') {
			url = url.avatarURL;

			if (!url)
				return false;
		}

		url = url || DBot.LastURLImageInChannel(channel);

		if (!url)
			return false;

		if (url.match(cover) || url.match(cover2) || url.match(/^\//))
			return false;

		if (!DBot.CheckURLImage(url)) {
			let emojiMatch = url.match(DBot.emojiRegExpWeak);

			if (!emojiMatch)
				return false;
			else
				return DBot.FindEmojiURL(url);
		}

		return url;
	}
};

module.exports = CommandHelper;
