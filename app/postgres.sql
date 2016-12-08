
CREATE TABLE IF NOT EXISTS channel_id (
	"ID" SERIAL PRIMARY KEY,
	"UID" varchar(64) NOT NULL,
	"SID" int NOT NULL
);

CREATE TABLE IF NOT EXISTS channel_names (
	"ID" int NOT NULL PRIMARY KEY,
	"NAME" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS command_bans_channel (
	"UID" int NOT NULL,
	"COMMAND" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS command_bans_server (
	"UID" int NOT NULL,
	"COMMAND" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS complains (
	"ID" SERIAL PRIMARY KEY,
	"SERVER" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"USER" int NOT NULL,
	"STAMP" int NOT NULL,
	"CONTENT" text NOT NULL
);

CREATE TABLE IF NOT EXISTS cvar_channel (
	"ID" int,
	"CVAR" varchar(64) NOT NULL,
	"VALUE" varchar(255) NOT NULL,
	PRIMARY KEY ("ID", "CVAR")
);

CREATE TABLE IF NOT EXISTS cvar_client (
	"ID" int,
	"CVAR" varchar(64) NOT NULL,
	"VALUE" varchar(255) NOT NULL,
	PRIMARY KEY ("ID", "CVAR")
);

CREATE TABLE IF NOT EXISTS cvar_server (
	"ID" int,
	"CVAR" varchar(64) NOT NULL,
	"VALUE" varchar(255) NOT NULL,
	PRIMARY KEY ("ID", "CVAR")
);

CREATE TABLE IF NOT EXISTS fortune (
	"ID" SERIAL PRIMARY KEY,
	"CATEGORY" char(16) NOT NULL,
	"CONTENT" text NOT NULL
);

CREATE TABLE IF NOT EXISTS fortune_vulgar (
	"ID" SERIAL PRIMARY KEY,
	"CATEGORY" char(16) NOT NULL,
	"CONTENT" text NOT NULL
);

CREATE TABLE IF NOT EXISTS infometr (
	"ID" SERIAL PRIMARY KEY,
	"PHRASE" varchar(255) NOT NULL,
	"VALUE" int NOT NULL
);

CREATE TABLE IF NOT EXISTS joinleft_log (
	"ID" SERIAL PRIMARY KEY,
	"USER" int NOT NULL,
	"SERVER" int NOT NULL,
	"STAMP" int NOT NULL,
	"STATUS" boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS lastonline (
	"ID" SERIAL PRIMARY KEY,
	"LASTONLINE" int NOT NULL
);

CREATE TABLE IF NOT EXISTS meme_cache (
	"ID" SERIAL PRIMARY KEY,
	"URL" varchar(64) NOT NULL,
	"NAME" varchar(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS name_logs (
	"MEMBER" int NOT NULL,
	"NAME" varchar(255) NOT NULL,
	"LASTUSE" int NOT NULL,
	"TIME" double precision NOT NULL,
	PRIMARY KEY ("MEMBER", "NAME")
);

CREATE TABLE IF NOT EXISTS roles_id (
	"ID" SERIAL PRIMARY KEY,
	"SERVER" int NOT NULL,
	"UID" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS server_id (
	"ID" SERIAL PRIMARY KEY,
	"UID" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS server_names (
	"ID" int NOT NULL PRIMARY KEY,
	"NAME" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS stats__chars_channel (
	"UID" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_channel_d (
	"UID" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_client (
	"UID" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_client_d (
	"UID" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_server (
	"UID" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_server_d (
	"UID" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__command_channel (
	"UID" int NOT NULL,
	"COMMAND" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_client (
	"UID" int NOT NULL,
	"COMMAND" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_server (
	"UID" int NOT NULL,
	"COMMAND" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_uchannel (
	"UID" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"COMMAND" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_userver (
	"UID" int NOT NULL,
	"USERVER" int NOT NULL,
	"COMMAND" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "USERVER", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__images_channel (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__images_client (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__images_server (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_channel (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_channel_d (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_channel_e (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_client (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_client_d (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_client_e (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_server (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_server_d (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_server_e (
	"UID" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__uchars_channel (
	"UID" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uchars_channel_d (
	"UID" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uchars_server (
	"UID" int NOT NULL,
	"USERVER" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uchars_server_d (
	"UID" int NOT NULL,
	"USERVER" int NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uimages_channel (
	"UID" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uimages_server (
	"UID" int NOT NULL,
	"USERVER" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_channel (
	"UID" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_channel_d (
	"UID" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_channel_e (
	"UID" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_server (
	"UID" int NOT NULL,
	"USERVER" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_server_d (
	"UID" int NOT NULL,
	"USERVER" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_server_e (
	"UID" int NOT NULL,
	"USERVER" int NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uwords_channel (
	"UID" int NOT NULL,
	"CHANNEL" int NOT NULL,
	"WORD" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "WORD", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uwords_server (
	"UID" int NOT NULL,
	"USERVER" int NOT NULL,
	"WORD" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "WORD", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__words_channel (
	"UID" int NOT NULL,
	"WORD" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "WORD")
);

CREATE TABLE IF NOT EXISTS stats__words_client (
	"UID" int NOT NULL,
	"WORD" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "WORD")
);

CREATE TABLE IF NOT EXISTS stats__words_server (
	"UID" int NOT NULL,
	"WORD" varchar(64) NOT NULL,
	"COUNT" int NOT NULL,
	PRIMARY KEY ("UID", "WORD")
);

CREATE TABLE IF NOT EXISTS steam_emoji_fail (
	"EMOJI" varchar(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS steamid (
	"STEAMID64" char(64) NOT NULL,
	"STEAMID" char(32) NOT NULL,
	"STEAMID3" char(32) NOT NULL,
	"CUSTOMID" varchar(128) NOT NULL,
	PRIMARY KEY ("STEAMID64")
);

CREATE TABLE IF NOT EXISTS steamid_fail (
	"STEAMID64" char(64) DEFAULT NULL,
	"STEAMID" char(32) DEFAULT NULL,
	"STEAMID3" char(32) DEFAULT NULL,
	"CUSTOMID" varchar(128) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS tags__google_server_init (
	"UID" int NOT NULL
);

CREATE TABLE IF NOT EXISTS timers_ids (
	"ID" SERIAL PRIMARY KEY,
	"TITLE" varchar(128) NOT NULL,
	"HASH" varchar(64) NOT NULL,
	"NOTIFY" boolean NOT NULL,
	"STAMP" int NOT NULL
);

CREATE TABLE IF NOT EXISTS timers_users (
	"ID" int NOT NULL,
	"TIMERID" int NOT NULL,
	PRIMARY KEY ("ID", "TIMERID")
);

CREATE TABLE IF NOT EXISTS uptime (
	"ID" int NOT NULL,
	"TOTAL_ONLINE" double precision NOT NULL DEFAULT 0,
	"TOTAL_OFFLINE" double precision NOT NULL DEFAULT 0,
	"ONLINE" double precision NOT NULL DEFAULT 0,
	"AWAY" double precision NOT NULL DEFAULT 0,
	"DNT" double precision NOT NULL DEFAULT 0,
	"STAMP" int NOT NULL,
	PRIMARY KEY ("ID")
);

CREATE TABLE IF NOT EXISTS uptime_bot (
	"START" int NOT NULL,
	"AMOUNT" int NOT NULL
);

CREATE TABLE IF NOT EXISTS urbancache (
	"WORD" varchar(64) NOT NULL,
	"DEFINITION" text NOT NULL,
	"TAGS" varchar(512) NOT NULL,
	"ULINK" varchar(64) NOT NULL,
	"DEXAMPLE" text NOT NULL,
	"USTAMP" int NOT NULL,
	PRIMARY KEY ("WORD")
);

CREATE TABLE IF NOT EXISTS user_id (
	"ID" SERIAL PRIMARY KEY,
	"UID" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_names (
	"ID" int NOT NULL,
	"USERNAME" varchar(64) NOT NULL,
	PRIMARY KEY ("ID")
);

CREATE TABLE IF NOT EXISTS users_roles (
	"USERID" int NOT NULL,
	"ROLEID" int NOT NULL,
	PRIMARY KEY ("USERID", "ROLEID")
);

CREATE TABLE IF NOT EXISTS votes_choices (
	"VOTE" int NOT NULL,
	"CHOICEID" int NOT NULL,
	"NAME" varchar(64) NOT NULL,
	"VOTES" int NOT NULL DEFAULT 0,
	PRIMARY KEY ("VOTE", "CHOICEID")
);

CREATE TABLE IF NOT EXISTS votes_list (
	"ID" SERIAL PRIMARY KEY,
	"SERVER" int NOT NULL,
	"CHANNEL" int DEFAULT NULL,
	"NAME" varchar(64) NOT NULL,
	"STAMP" int NOT NULL,
	"CLOSED" boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS votes_text (
	"ID" int NOT NULL,
	"TEXT" text NOT NULL,
	PRIMARY KEY ("ID")
);

CREATE TABLE IF NOT EXISTS votes_votes (
	"VOTE" int NOT NULL,
	"USER" int NOT NULL,
	"CHOICE" int NOT NULL,
	PRIMARY KEY ("VOTE", "USER")
);

CREATE TABLE IF NOT EXISTS roles_names (
	"ROLEID" INTEGER NOT NULL PRIMARY KEY,
	"NAME" VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS member_id (
	"ID" SERIAL PRIMARY KEY,
	"USER" INTEGER NOT NULL,
	"SERVER" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS member_roles (
	"MEMBER" INTEGER NOT NULL,
	"ROLE" INTEGER NOT NULL,
	PRIMARY KEY ("MEMBER", "ROLE")
);

CREATE TABLE IF NOT EXISTS roles_log (
	"ID" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL,
	"ROLE" INTEGER NOT NULL,
	"TYPE" BOOLEAN NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS member_names (
	"ID" int PRIMARY KEY,
	"NAME" VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS killicons (
	"ID" SERIAL PRIMARY KEY,
	"NAME" VARCHAR(64) NOT NULL,
	"FILENAME" VARCHAR(64) NOT NULL,
	"CLASSNAME" VARCHAR(64) NOT NULL,
	"WIDTH" INTEGER NOT NULL,
	"HEIGHT" INTEGER NOT NULL
);

DROP FUNCTION IF EXISTS get_role_id_combined(fUID VARCHAR(64), fSERVER2 VARCHAR(64));
DROP FUNCTION IF EXISTS get_role_id(fUID VARCHAR(64), fSERVER INTEGER);
DROP FUNCTION IF EXISTS get_channel_id(fUID VARCHAR(64), sID INTEGER);
DROP FUNCTION IF EXISTS get_server_id(sID VARCHAR(64));
DROP FUNCTION IF EXISTS get_user_id(sID VARCHAR(64));
DROP FUNCTION IF EXISTS get_member_id(userid VARCHAR(64), server VARCHAR(64));
DROP FUNCTION IF EXISTS restore_member_id(memberid INTEGER);
DROP FUNCTION IF EXISTS restore_member(memberid INTEGER);

CREATE FUNCTION get_role_id_combined(fUID VARCHAR(64), fSERVER2 VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
DECLARE fSERVER INTEGER;
BEGIN
	fSERVER := get_server_id(fSERVER2);
	
	SELECT "roles_id"."ID" INTO last_id FROM "roles_id" WHERE "roles_id"."UID" = fUID AND "roles_id"."SERVER" = fSERVER;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "roles_id" ("SERVER", "UID") VALUES (fSERVER, fUID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION get_role_id(fUID VARCHAR(64), fSERVER INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "roles_id"."ID" INTO last_id FROM "roles_id" WHERE "roles_id"."UID" = fUID AND "roles_id"."SERVER" = fSERVER;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "roles_id" ("SERVER", "UID") VALUES (fSERVER, fUID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION get_channel_id(fUID VARCHAR(64), sID INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "channel_id"."ID" INTO last_id FROM "channel_id" WHERE "channel_id"."UID" = fUID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "channel_id" ("UID", "SID") VALUES (fUID, sID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION get_server_id(sID VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "server_id"."ID" INTO last_id FROM "server_id" WHERE "server_id"."UID" = sID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "server_id" ("UID") VALUES (sID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION get_user_id(sID VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "user_id"."ID" INTO last_id FROM "user_id" WHERE "user_id"."UID" = sID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "user_id" ("UID") VALUES (sID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION get_member_id(userid VARCHAR(64), server VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
DECLARE usr_internal_id INTEGER;
DECLARE ser_internal_id INTEGER;
BEGIN
	usr_internal_id := get_user_id(userid);
	ser_internal_id := get_server_id(server);
	
	SELECT "member_id"."ID" INTO last_id FROM "member_id" WHERE "member_id"."USER" = usr_internal_id AND "member_id"."SERVER" = ser_internal_id;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "member_id" ("USER", "SERVER") VALUES (usr_internal_id, ser_internal_id) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION restore_member_id(memberid INTEGER)
RETURNS INTEGER AS $$
BEGIN
	RETURN (SELECT "member_id"."USER" FROM "member_id" WHERE "member_id"."ID" = memberid);
END $$ LANGUAGE plpgsql;

CREATE FUNCTION restore_member(memberid INTEGER)
RETURNS VARCHAR(64) as $$
DECLARE iuid INTEGER;
BEGIN
	iuid := restore_member_id(memberid);
	
	RETURN (SELECT "user_id"."UID" FROM "user_id" WHERE "user_id"."ID" = iuid);
END; $$ LANGUAGE plpgsql;

