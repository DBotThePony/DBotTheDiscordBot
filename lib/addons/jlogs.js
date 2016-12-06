
/*

CREATE TABLE IF NOT EXISTS `joinleft_log` (
	`ID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,
	`USER` INTEGER NOT NULL,
	`SERVER` INTEGER NOT NULL,
	`STATMP` INTEGER NOT NULL,
	`STATUS` BOOLEAN NOT NULL
)

*/

MySQL.query('CREATE TABLE IF NOT EXISTS `joinleft_log` (`ID` INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT,`USER` INTEGER NOT NULL,`SERVER` INTEGER NOT NULL,`STATMP` INTEGER NOT NULL,`STATUS` BOOLEAN NOT NULL)');

hook.Add('ValidClientJoinsServer', 'JLogs', function(user, server, member) {
	setTimeout(function() {
		MySQL.query('INSERT INTO `joinleft_log` (`USER`, `SERVER`, `STAMP`, `STATUS`) VALUES (' + DBot.GetUserID(user) + ', ' + DBot.GetServerID(server) + ', ' + CurTime() + ', 1)');
	}, 1000);
});

hook.Add('ValidClientLeftServer', 'JLogs', function(user, server, member) {
	setTimeout(function() {
		MySQL.query('INSERT INTO `joinleft_log` (`USER`, `SERVER`, `STAMP`, `STATUS`) VALUES (' + DBot.GetUserID(user) + ', ' + DBot.GetServerID(server) + ', ' + CurTime() + ', 0)');
	}, 1000);
});
