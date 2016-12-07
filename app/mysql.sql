
CREATE TABLE IF NOT EXISTS `channel_id` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`UID` varchar(64) NOT NULL,
	`SID` int(11) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `channel_names` (
	`ID` int(11) NOT NULL,
	`NAME` varchar(64) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `command_bans_channel` (
	`UID` int(11) NOT NULL,
	`COMMAND` varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS `command_bans_server` (
	`UID` int(11) NOT NULL,
	`COMMAND` varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS `complains` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`SERVER` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`USER` int(11) NOT NULL,
	`STAMP` int(11) NOT NULL,
	`CONTENT` text NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `cvar_channel` (
	`ID` int(11) NOT NULL,
	`CVAR` varchar(64) NOT NULL,
	`VALUE` varchar(255) NOT NULL,
	PRIMARY KEY (`ID`, `CVAR`)
);

CREATE TABLE IF NOT EXISTS `cvar_client` (
	`ID` int(11) NOT NULL,
	`CVAR` varchar(64) NOT NULL,
	`VALUE` varchar(255) NOT NULL,
	PRIMARY KEY (`ID`, `CVAR`)
);

CREATE TABLE IF NOT EXISTS `cvar_server` (
	`ID` int(11) NOT NULL,
	`CVAR` varchar(64) NOT NULL,
	`VALUE` varchar(255) NOT NULL,
	PRIMARY KEY (`ID`, `CVAR`)
);

CREATE TABLE IF NOT EXISTS `fortune` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`CATEGORY` char(16) NOT NULL,
	`CONTENT` text NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `fortune_vulgar` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`CATEGORY` char(16) NOT NULL,
	`CONTENT` text NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `infometr` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`PHRASE` varchar(255) NOT NULL,
	`VALUE` int(11) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `joinleft_log` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`USER` int(11) NOT NULL,
	`SERVER` int(11) NOT NULL,
	`STAMP` int(11) NOT NULL,
	`STATUS` tinyint(1) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `lastonline` (
	`ID` int(11) NOT NULL,
	`LASTONLINE` int(11) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `meme_cache` (
	`ID` int(11) NOT NULL,
	`URL` varchar(64) NOT NULL,
	`NAME` varchar(128) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `name_logs` (
	`ID` int(11) NOT NULL,
	`SERVER` int(11) NOT NULL,
	`NAME` varchar(255) NOT NULL,
	`LASTUSE` int(11) NOT NULL,
	`TIME` double NOT NULL,
	PRIMARY KEY (`ID`, `SERVER`, `NAME`)
);

CREATE TABLE IF NOT EXISTS `roles_id` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`SERVER` int(11) NOT NULL,
	`UID` varchar(64) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `server_id` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`UID` varchar(64) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `server_names` (
	`ID` int(11) NOT NULL,
	`NAME` varchar(64) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `stats__chars_channel` (
	`UID` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__chars_channel_d` (
	`UID` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__chars_client` (
	`UID` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__chars_client_d` (
	`UID` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__chars_server` (
	`UID` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__chars_server_d` (
	`UID` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__command_channel` (
	`UID` int(11) NOT NULL,
	`COMMAND` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__command_client` (
	`UID` int(11) NOT NULL,
	`COMMAND` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__command_server` (
	`UID` int(11) NOT NULL,
	`COMMAND` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__command_uchannel` (
	`UID` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`COMMAND` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `CHANNEL`, `COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__command_userver` (
	`UID` int(11) NOT NULL,
	`USERVER` int(11) NOT NULL,
	`COMMAND` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `USERVER`, `COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__images_channel` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__images_client` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__images_server` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_channel` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_channel_d` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_channel_e` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_client` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_client_d` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_client_e` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_server` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_server_d` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__phrases_server_e` (
	`UID` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`)
);

CREATE TABLE IF NOT EXISTS `stats__uchars_channel` (
	`UID` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`, `CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uchars_channel_d` (
	`UID` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`, `CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uchars_server` (
	`UID` int(11) NOT NULL,
	`USERVER` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`, `USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uchars_server_d` (
	`UID` int(11) NOT NULL,
	`USERVER` int(11) NOT NULL,
	`COUNT` bigint(20) NOT NULL,
	PRIMARY KEY (`UID`, `USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uimages_channel` (
	`UID` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uimages_server` (
	`UID` int(11) NOT NULL,
	`USERVER` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_channel` (
	`UID` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_channel_d` (
	`UID` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_channel_e` (
	`UID` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_server` (
	`UID` int(11) NOT NULL,
	`USERVER` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_server_d` (
	`UID` int(11) NOT NULL,
	`USERVER` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_server_e` (
	`UID` int(11) NOT NULL,
	`USERVER` int(11) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uwords_channel` (
	`UID` int(11) NOT NULL,
	`CHANNEL` int(11) NOT NULL,
	`WORD` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `WORD`, `CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uwords_server` (
	`UID` int(11) NOT NULL,
	`USERVER` int(11) NOT NULL,
	`WORD` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `WORD`, `USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__words_channel` (
	`UID` int(11) NOT NULL,
	`WORD` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `WORD`)
);

CREATE TABLE IF NOT EXISTS `stats__words_client` (
	`UID` int(11) NOT NULL,
	`WORD` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `WORD`)
);

CREATE TABLE IF NOT EXISTS `stats__words_server` (
	`UID` int(11) NOT NULL,
	`WORD` varchar(64) NOT NULL,
	`COUNT` int(11) NOT NULL,
	PRIMARY KEY (`UID`, `WORD`)
);

CREATE TABLE IF NOT EXISTS `steam_emoji_fail` (
	`EMOJI` varchar(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS `steamid` (
	`STEAMID64` char(64) NOT NULL,
	`STEAMID` char(32) NOT NULL,
	`STEAMID3` char(32) NOT NULL,
	`CUSTOMID` varchar(128) NOT NULL,
	PRIMARY KEY (`STEAMID64`)
);

CREATE TABLE IF NOT EXISTS `steamid_fail` (
	`STEAMID64` char(64) DEFAULT NULL,
	`STEAMID` char(32) DEFAULT NULL,
	`STEAMID3` char(32) DEFAULT NULL,
	`CUSTOMID` varchar(128) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS `tags__google_server_init` (
	`UID` int(11) NOT NULL
);

CREATE TABLE IF NOT EXISTS `timers_ids` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`TITLE` varchar(128) NOT NULL,
	`HASH` varchar(64) NOT NULL,
	`NOTIFY` tinyint(1) NOT NULL,
	`STAMP` int(11) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `timers_users` (
	`ID` int(11) NOT NULL,
	`TIMERID` int(11) NOT NULL,
	PRIMARY KEY (`ID`, `TIMERID`)
);

CREATE TABLE IF NOT EXISTS `uptime` (
	`ID` int(11) NOT NULL,
	`TOTAL_ONLINE` double NOT NULL DEFAULT '0',
	`TOTAL_OFFLINE` double NOT NULL DEFAULT '0',
	`ONLINE` double NOT NULL DEFAULT '0',
	`AWAY` double NOT NULL DEFAULT '0',
	`DNT` double NOT NULL DEFAULT '0',
	`STAMP` int(11) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `uptime_bot` (
	`START` int(11) NOT NULL,
	`AMOUNT` int(11) NOT NULL
);

CREATE TABLE IF NOT EXISTS `urbancache` (
	`WORD` varchar(64) NOT NULL,
	`DEFINITION` text NOT NULL,
	`TAGS` varchar(512) NOT NULL,
	`ULINK` varchar(64) NOT NULL,
	`DEXAMPLE` text NOT NULL,
	`USTAMP` int(11) NOT NULL,
	PRIMARY KEY (`WORD`)
);

CREATE TABLE IF NOT EXISTS `user_id` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`UID` varchar(64) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `user_names` (
	`ID` int(11) NOT NULL,
	`USERNAME` varchar(64) NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `users_roles` (
	`USERID` int(11) NOT NULL,
	`ROLEID` int(11) NOT NULL,
	PRIMARY KEY (`USERID`, `ROLEID`)
);

CREATE TABLE IF NOT EXISTS `votes_choices` (
	`VOTE` int(11) NOT NULL,
	`CHOICEID` int(11) NOT NULL,
	`NAME` varchar(64) NOT NULL,
	`VOTES` int(11) NOT NULL DEFAULT '0',
	PRIMARY KEY (`VOTE`, `CHOICEID`)
);

CREATE TABLE IF NOT EXISTS `votes_list` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`SERVER` int(11) NOT NULL,
	`CHANNEL` int(11) DEFAULT NULL,
	`NAME` varchar(64) NOT NULL,
	`STAMP` int(11) NOT NULL,
	`CLOSED` tinyint(1) NOT NULL DEFAULT '0',
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `votes_text` (
	`ID` int(11) NOT NULL,
	`TEXT` text NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `votes_votes` (
	`VOTE` int(11) NOT NULL,
	`USER` int(11) NOT NULL,
	`CHOICE` int(11) NOT NULL,
	PRIMARY KEY (`VOTE`, `USER`)
);

CREATE TABLE IF NOT EXISTS `roles_names` (
	`ROLEID` INTEGER NOT NULL PRIMARY KEY,
	`NAME` VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS `member_id` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`USER` INTEGER NOT NULL,
	`SERVER` INTEGER NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `member_roles` (
	`MEMBER` INTEGER NOT NULL,
	`ROLE` INTEGER NOT NULL,
	PRIMARY KEY (`MEMBER`, `ROLE`)
);

CREATE TABLE IF NOT EXISTS `roles_log` (
	`ID` int(11) NOT NULL AUTO_INCREMENT,
	`MEMBER` INTEGER NOT NULL,
	`ROLE` INTEGER NOT NULL,
	`TYPE` BOOLEAN NOT NULL,
	`STAMP` INTEGER NOT NULL,
	PRIMARY KEY (`ID`)
);

CREATE TABLE IF NOT EXISTS `member_names` (
	`ID` int(11) NOT NULL,
	`NAME` VARCHAR(64) NOT NULL,
	PRIMARY KEY (`ID`)
);

-- ///Functions///

CREATE FUNCTION IF NOT EXISTS `get_role_id_combined`(fUID VARCHAR(64), fSERVER2 VARCHAR(64))
RETURNS INTEGER
BEGIN
	DECLARE id INTEGER;
	DECLARE fSERVER INTEGER;
	SET fSERVER = get_server_id(fSERVER2);
	
	SELECT `roles_id`.`ID` INTO id FROM `roles_id` WHERE `roles_id`.`UID` = fUID AND `roles_id`.`SERVER` = fSERVER;
	
	IF (id IS NULL) THEN
		INSERT INTO `roles_id` (`SERVER`, `UID`) VALUES (`fSERVER`, `fUID`);
		SELECT last_insert_id() INTO id;
	END IF;
	
	RETURN id;
END//

CREATE FUNCTION IF NOT EXISTS `get_role_id`(fUID VARCHAR(64), fSERVER INTEGER)
RETURNS INTEGER
BEGIN
	DECLARE id INTEGER;
	
	SELECT `roles_id`.`ID` INTO id FROM `roles_id` WHERE `roles_id`.`UID` = fUID AND `roles_id`.`SERVER` = fSERVER;
	
	IF (id IS NULL) THEN
		INSERT INTO `roles_id` (`SERVER`, `UID`) VALUES (`fSERVER`, `fUID`);
		SELECT last_insert_id() INTO id;
	END IF;
	
	RETURN id;
END//

CREATE FUNCTION IF NOT EXISTS `get_channel_id`(`fUID` VARCHAR(64), `sID` INTEGER)
RETURNS INTEGER
BEGIN
	DECLARE id INTEGER;
	
	SELECT `channel_id`.`ID` INTO id FROM `channel_id` WHERE `channel_id`.`UID` = `fUID`;
	
	IF (id IS NULL) THEN
		INSERT INTO `channel_id` (`UID`, `SID`) VALUES (`fUID`, `sID`);
		SELECT last_insert_id() INTO id;
	END IF;
	
	RETURN id;
END//

CREATE FUNCTION IF NOT EXISTS `get_server_id`(`sID` VARCHAR(64))
RETURNS INTEGER
BEGIN
	DECLARE id INTEGER;
	
	SELECT `server_id`.`ID` INTO id FROM `server_id` WHERE `server_id`.`UID` = `sID`;
	
	IF (id IS NULL) THEN
		INSERT INTO `server_id` (`UID`) VALUES (`sID`);
		SELECT last_insert_id() INTO id;
	END IF;
	
	RETURN id;
END//

CREATE FUNCTION IF NOT EXISTS `get_user_id`(`sID` VARCHAR(64))
RETURNS INTEGER
BEGIN
	DECLARE id INTEGER;
	
	SELECT `user_id`.`ID` INTO id FROM `user_id` WHERE `user_id`.`UID` = `sID`;
	
	IF (id IS NULL) THEN
		INSERT INTO `user_id` (`UID`) VALUES (`sID`);
		SELECT last_insert_id() INTO id;
	END IF;
	
	RETURN id;
END//

CREATE FUNCTION IF NOT EXISTS `get_member_id`(`userid` VARCHAR(64), `server` VARCHAR(64))
RETURNS INTEGER
BEGIN
	DECLARE id INTEGER;
	DECLARE usr_internal_id INTEGER;
	DECLARE ser_internal_id INTEGER;
	
	SET usr_internal_id = get_user_id(`userid`);
	SET ser_internal_id = get_server_id(`server`);
	
	SELECT `member_id`.`ID` INTO id FROM `member_id` WHERE `member_id`.`USER` = usr_internal_id AND `member_id`.`SERVER` = ser_internal_id;
	
	IF (id IS NULL) THEN
		INSERT INTO `member_id` (`USER`, `SERVER`) VALUES (usr_internal_id, ser_internal_id);
		SELECT last_insert_id() INTO id;
	END IF;
	
	RETURN id;
END//

CREATE FUNCTION IF NOT EXISTS `restore_member_id`(`memberid` INTEGER)
RETURNS INTEGER
BEGIN
	RETURN (SELECT `member_id`.`USER` FROM `member_id` WHERE `member_id`.`ID` = `memberid`);
END//

CREATE FUNCTION IF NOT EXISTS `restore_member`(`memberid` INTEGER)
RETURNS VARCHAR(64)
BEGIN
	DECLARE iuid INTEGER;
	SET iuid = restore_member_id(`memberid`);
	
	RETURN (SELECT `user_id`.`UID` FROM `user_id` WHERE `user_id`.`ID` = iuid);
END//

