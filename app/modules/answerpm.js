
var hellows = [
	'hi',
	'hello',
	'privet',
	'привет',
	'хай',
	'прив',
	'hoi',
];

var __hello = [];

for (var i in hellows) {
	__hello[i] = new RegExp('^' + hellows[i], 'i');
}

hook.Add('OnHumanMessage', 'AnswerPMHello', function(msg) {
	if (!DBot.IsPM(msg))
		return;
	
	var message = msg.content;
	
	for (var i in __hello) {
		if (message.match(__hello[i])) {
			msg.reply('Hellow pony stranger x3. You can get help by typing help');
			return true;
		}
	}
});
