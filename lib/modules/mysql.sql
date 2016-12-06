
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
  PRIMARY KEY (`ID`,`CVAR`)
);

CREATE TABLE IF NOT EXISTS `cvar_client` (
  `ID` int(11) NOT NULL,
  `CVAR` varchar(64) NOT NULL,
  `VALUE` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`,`CVAR`)
);

CREATE TABLE IF NOT EXISTS `cvar_server` (
  `ID` int(11) NOT NULL,
  `CVAR` varchar(64) NOT NULL,
  `VALUE` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`,`CVAR`)
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
  PRIMARY KEY (`ID`,`SERVER`,`NAME`)
);

CREATE TABLE IF NOT EXISTS `roles_id` (
  `ID` int(11) NOT NULL,
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
  PRIMARY KEY (`UID`,`COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__command_client` (
  `UID` int(11) NOT NULL,
  `COMMAND` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__command_server` (
  `UID` int(11) NOT NULL,
  `COMMAND` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__command_uchannel` (
  `UID` int(11) NOT NULL,
  `CHANNEL` int(11) NOT NULL,
  `COMMAND` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`CHANNEL`,`COMMAND`)
);

CREATE TABLE IF NOT EXISTS `stats__command_userver` (
  `UID` int(11) NOT NULL,
  `USERVER` int(11) NOT NULL,
  `COMMAND` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`USERVER`,`COMMAND`)
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
  PRIMARY KEY (`UID`,`CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uchars_channel_d` (
  `UID` int(11) NOT NULL,
  `CHANNEL` int(11) NOT NULL,
  `COUNT` bigint(20) NOT NULL,
  PRIMARY KEY (`UID`,`CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uchars_server` (
  `UID` int(11) NOT NULL,
  `USERVER` int(11) NOT NULL,
  `COUNT` bigint(20) NOT NULL,
  PRIMARY KEY (`UID`,`USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uchars_server_d` (
  `UID` int(11) NOT NULL,
  `USERVER` int(11) NOT NULL,
  `COUNT` bigint(20) NOT NULL,
  PRIMARY KEY (`UID`,`USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uimages_channel` (
  `UID` int(11) NOT NULL,
  `CHANNEL` int(11) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uimages_server` (
  `UID` int(11) NOT NULL,
  `USERVER` int(11) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_channel` (
  `UID` int(11) NOT NULL,
  `CHANNEL` int(11) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_channel_d` (
  `UID` int(11) NOT NULL,
  `CHANNEL` int(11) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_channel_e` (
  `UID` int(11) NOT NULL,
  `CHANNEL` int(11) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_server` (
  `UID` int(11) NOT NULL,
  `USERVER` int(11) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_server_d` (
  `UID` int(11) NOT NULL,
  `USERVER` int(11) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uphrases_server_e` (
  `UID` int(11) NOT NULL,
  `USERVER` int(11) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__uwords_channel` (
  `UID` int(11) NOT NULL,
  `CHANNEL` int(11) NOT NULL,
  `WORD` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`WORD`,`CHANNEL`)
);

CREATE TABLE IF NOT EXISTS `stats__uwords_server` (
  `UID` int(11) NOT NULL,
  `USERVER` int(11) NOT NULL,
  `WORD` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`WORD`,`USERVER`)
);

CREATE TABLE IF NOT EXISTS `stats__words_channel` (
  `UID` int(11) NOT NULL,
  `WORD` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`WORD`)
);

CREATE TABLE IF NOT EXISTS `stats__words_client` (
  `UID` int(11) NOT NULL,
  `WORD` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`WORD`)
);

CREATE TABLE IF NOT EXISTS `stats__words_server` (
  `UID` int(11) NOT NULL,
  `WORD` varchar(64) NOT NULL,
  `COUNT` int(11) NOT NULL,
  PRIMARY KEY (`UID`,`WORD`)
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
  PRIMARY KEY (`ID`,`TIMERID`)
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
  PRIMARY KEY (`USERID`,`ROLEID`)
);

CREATE TABLE IF NOT EXISTS `votes_choices` (
  `VOTE` int(11) NOT NULL,
  `CHOICEID` int(11) NOT NULL,
  `NAME` varchar(64) NOT NULL,
  `VOTES` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`VOTE`,`CHOICEID`)
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
  PRIMARY KEY (`VOTE`,`USER`)
);

/*
DELIMITER //

DROP FUNCTION IF EXISTS `get_role_id`//

CREATE FUNCTION `get_role_id`(`fUID` VARCHAR(64), `fSERVER` INTEGER)
	RETURNS INTEGER
	
	BEGIN
		DECLARE @id INTEGER;
		@id = SELECT `roles_id`.`ID` FROM `roles_id` WHERE `roles_id`.`UID` = `fUID` AND `roles_id`.`SERVER` = `fSERVER`;
		
		IF (@id IS NULL) THEN
			@id = INSERT INTO `roles_id` (
	`SERVER`, `UID`) VALUES (`fSERVER`, `fUID`);
			@id = SELECT last_insert_id();
		END IF;
	END//

DELIMITER ;

*/
