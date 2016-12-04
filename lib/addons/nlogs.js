
/*
CREATE TABLE IF NOT EXISTS `name_logs` (
	`ID` INTEGER NOT NULL,
	`SERVER` INTEGER NOT NULL,
	`NAME` VARCHAR(255) NOT NULL,
	`LASTUSE` INTEGER NOT NULL,
	`TIME` INTEGER NOT NULL,
	PRIMARY KEY (`ID`, `SERVER`, `NAME`)
)
*/

MySQL.query('CREATE TABLE IF NOT EXISTS `name_logs` (`ID` INTEGER NOT NULL, `SERVER` INTEGER NOT NULL, `NAME` VARCHAR(255) NOT NULL, `LASTUSE` INTEGER NOT NULL, `TIME` INTEGER NOT NULL, PRIMARY KEY (`ID`, `SERVER`, `NAME`))');

hook.Add('UpdateMemberVars', 'NameLogs', function(member) {
	try {
		let uid = DBot.GetUserID(member.user);
		let sid = DBot.GetServerID(member.guild);
		let name = member.nickname || member.user.username;
		let time = CurTime();
		member.NTime = member.NTime || time;
		let delta = Math.floor(time - member.NTime);
		
		if (delta < 1) {
			return; // Wait more
		}
		
		member.NTime = time;
		
		MySQL.query('INSERT INTO `name_logs` (`ID`, `SERVER`, `NAME`, `LASTUSE`, `TIME`) VALUES (' + uid + ', ' + sid + ', ' + Util.escape(name) + ', ' + time + ', ' + delta + ') ON DUPLICATE KEY UPDATE `LASTUSE` = ' + time + ' AND `TIME` = `TIME` + ' + delta);
	} catch(err) {
		console.error(err);
	}
});