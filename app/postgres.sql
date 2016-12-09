
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discord_user_status') THEN
		CREATE TYPE discord_user_status AS ENUM ('online', 'idle', 'dnd', 'offline');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS channel_id (
	"ID" SERIAL PRIMARY KEY,
	"UID" char(64) NOT NULL,
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
	"UID" char(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS server_id (
	"ID" SERIAL PRIMARY KEY,
	"UID" char(64) NOT NULL
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

CREATE TABLE IF NOT EXISTS user_status (
	"ID" int NOT NULL,
	"STATUS" discord_user_status NOT NULL,
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
	"UID" char(64) NOT NULL
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
DROP FUNCTION IF EXISTS tags_tables(fName VARCHAR(64));
DROP FUNCTION IF EXISTS restore_member(memberid INTEGER);
DROP FUNCTION IF EXISTS user_status_heartbeat(cTime int);
DROP FUNCTION IF EXISTS update_nicknames_stats(cTime int);
DROP FUNCTION IF EXISTS stats_hit(user_id_raw varchar(64), message_length int, words varchar(64)[], images_seneded int);
DROP FUNCTION IF EXISTS stats_hit(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), message_length int, words VARCHAR(64)[], images_seneded int);
DROP FUNCTION IF EXISTS stats_edit(user_id_raw varchar(64));
DROP FUNCTION IF EXISTS stats_edit(user_id_raw varchar(64), channel_id_raw varchar(64), server_id_raw varchar(64));
DROP FUNCTION IF EXISTS stats_delete(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), message_length int);
DROP FUNCTION IF EXISTS stats_delete(user_id_raw VARCHAR(64), message_length int);
DROP FUNCTION IF EXISTS stats_command(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), command varchar(64));
DROP FUNCTION IF EXISTS stats_command(user_id_raw VARCHAR(64), command varchar(64));

CREATE FUNCTION tags_tables(fName VARCHAR(64))
RETURNS void AS $$
BEGIN
	EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
		UID INTEGER NOT NULL
	);', CONCAT('tags__', fName, '_client_init'));
	
	EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
		UID INTEGER NOT NULL,
		TAG VARCHAR(64) NOT NULL
	);', CONCAT('tags__', fName, '_client'));
	
	EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
		UID INTEGER NOT NULL
	);', CONCAT('tags__', fName, '_server_init'));
	
	EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
		UID INTEGER NOT NULL,
		TAG VARCHAR(64) NOT NULL
	);', CONCAT('tags__', fName, '_server'));
	
	EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
		UID INTEGER NOT NULL
	);', CONCAT('tags__', fName, '_channel_init'));
	
	EXECUTE format('CREATE TABLE IF NOT EXISTS %I (
		UID INTEGER NOT NULL,
		TAG VARCHAR(64) NOT NULL
	);', CONCAT('tags__', fName, '_channel'));
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION stats_hit(user_id_raw varchar(64), message_length int, words varchar(64)[], images_seneded int)
RETURNS void AS $$
DECLARE user_id INTEGER;
DECLARE word VARCHAR(64);
BEGIN
	user_id := get_user_id(user_id_raw);
	
	INSERT INTO stats__phrases_client ("UID", "COUNT") VALUES (user_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_client."COUNT" + 1;
	INSERT INTO stats__chars_client ("UID", "COUNT") VALUES (user_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_client."COUNT" + message_length;
	
	FOREACH word IN ARRAY words LOOP
		INSERT INTO stats__words_client ("UID", "WORD", "COUNT") VALUES (user_id, word, 1) ON CONFLICT ("UID", "WORD") DO UPDATE SET "COUNT" = stats__words_client."COUNT" + 1;
	END LOOP;
	
	IF (images_seneded > 0) THEN
		INSERT INTO stats__images_client ("UID", "COUNT") VALUES (user_id, images_seneded) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__images_client."COUNT" + images_seneded;
	END IF;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION stats_edit(user_id_raw varchar(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	
	INSERT INTO stats__phrases_client_e ("UID", "COUNT") VALUES (user_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_client_e."COUNT" + 1;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION stats_edit(user_id_raw varchar(64), channel_id_raw varchar(64), server_id_raw varchar(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
DECLARE server_id INTEGER;
DECLARE channel_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	server_id := get_server_id(server_id_raw);
	channel_id := get_channel_id(channel_id_raw, server_id);
	
	INSERT INTO stats__phrases_client_e ("UID", "COUNT") VALUES (user_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_client_e."COUNT" + 1;
	INSERT INTO stats__phrases_channel_e ("UID", "COUNT") VALUES (channel_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_channel_e."COUNT" + 1;
	INSERT INTO stats__uphrases_channel_e ("UID", "CHANNEL", "COUNT") VALUES (user_id, channel_id, 1) ON CONFLICT ("UID", "CHANNEL") DO UPDATE SET "COUNT" = stats__uphrases_channel_e."COUNT" + 1;
	INSERT INTO stats__phrases_server_e ("UID", "COUNT") VALUES (server_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_server_e."COUNT" + 1;
	INSERT INTO stats__uphrases_server_e ("UID", "USERVER", "COUNT") VALUES (user_id, server_id, 1) ON CONFLICT ("UID", "USERVER") DO UPDATE SET "COUNT" = stats__uphrases_server_e."COUNT" + 1;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION stats_hit(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), message_length int, words VARCHAR(64)[], images_seneded int)
RETURNS void AS $$
DECLARE user_id INTEGER;
DECLARE server_id INTEGER;
DECLARE channel_id INTEGER;
DECLARE word VARCHAR(64);
BEGIN
	user_id := get_user_id(user_id_raw);
	server_id := get_server_id(server_id_raw);
	channel_id := get_channel_id(channel_id_raw, server_id);
	
	INSERT INTO stats__phrases_client ("UID", "COUNT") VALUES (user_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_client."COUNT" + 1;
	INSERT INTO stats__chars_client ("UID", "COUNT") VALUES (user_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_client."COUNT" + message_length;
	
	INSERT INTO stats__phrases_channel ("UID", "COUNT") VALUES (channel_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_channel."COUNT" + 1;
	INSERT INTO stats__uphrases_channel ("UID", "CHANNEL", "COUNT") VALUES (user_id, channel_id, 1) ON CONFLICT ("UID", "CHANNEL") DO UPDATE SET "COUNT" = stats__uphrases_channel."COUNT" + 1;
	INSERT INTO stats__phrases_server ("UID", "COUNT") VALUES (server_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_server."COUNT" + 1;
	INSERT INTO stats__uphrases_server ("UID", "USERVER", "COUNT") VALUES (user_id, server_id, 1) ON CONFLICT ("UID", "USERVER") DO UPDATE SET "COUNT" = stats__uphrases_server."COUNT" + 1;
	
	INSERT INTO stats__chars_channel ("UID", "COUNT") VALUES (channel_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_channel."COUNT" + message_length;
	INSERT INTO stats__uchars_channel ("UID", "CHANNEL", "COUNT") VALUES (user_id, channel_id, message_length) ON CONFLICT ("UID", "CHANNEL") DO UPDATE SET "COUNT" = stats__uchars_channel."COUNT" + message_length;
	INSERT INTO stats__chars_server ("UID", "COUNT") VALUES (server_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_server."COUNT" + message_length;
	INSERT INTO stats__uchars_server ("UID", "USERVER", "COUNT") VALUES (user_id, server_id, message_length) ON CONFLICT ("UID", "USERVER") DO UPDATE SET "COUNT" = stats__uchars_server."COUNT" + message_length;
	
	FOREACH word IN ARRAY words LOOP
		INSERT INTO stats__words_client ("UID", "WORD", "COUNT") VALUES (user_id, word, 1) ON CONFLICT ("UID", "WORD") DO UPDATE SET "COUNT" = stats__words_client."COUNT" + 1;
		
		INSERT INTO stats__words_channel ("UID", "WORD", "COUNT") VALUES (channel_id, word, 1) ON CONFLICT ("UID", "WORD") DO UPDATE SET "COUNT" = stats__words_channel."COUNT" + 1;
		INSERT INTO stats__uwords_channel ("UID", "CHANNEL", "WORD", "COUNT") VALUES (user_id, channel_id, word, 1) ON CONFLICT ("UID", "CHANNEL", "WORD") DO UPDATE SET "COUNT" = stats__uwords_channel."COUNT" + 1;
		INSERT INTO stats__words_server ("UID", "WORD", "COUNT") VALUES (server_id, word, 1) ON CONFLICT ("UID", "WORD") DO UPDATE SET "COUNT" = stats__words_server."COUNT" + 1;
		INSERT INTO stats__uwords_server ("UID", "USERVER", "WORD", "COUNT") VALUES (user_id, server_id, word, 1) ON CONFLICT ("UID", "USERVER", "WORD") DO UPDATE SET "COUNT" = stats__uwords_server."COUNT" + 1;
	END LOOP;
	
	IF (images_seneded > 0) THEN
		INSERT INTO stats__images_client ("UID", "COUNT") VALUES (user_id, images_seneded) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__images_client."COUNT" + images_seneded;
		
		INSERT INTO stats__images_channel ("UID", "COUNT") VALUES (channel_id, images_seneded) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__images_channel."COUNT" + images_seneded;
		INSERT INTO stats__uimages_channel ("UID", "CHANNEL", "COUNT") VALUES (user_id, channel_id, images_seneded) ON CONFLICT ("UID", "CHANNEL") DO UPDATE SET "COUNT" = stats__uimages_channel."COUNT" + images_seneded;
		INSERT INTO stats__images_server ("UID", "COUNT") VALUES (server_id, images_seneded) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__images_server."COUNT" + images_seneded;
		INSERT INTO stats__uimages_server ("UID", "USERVER", "COUNT") VALUES (user_id, server_id, images_seneded) ON CONFLICT ("UID", "USERVER") DO UPDATE SET "COUNT" = stats__uimages_server."COUNT" + images_seneded;
	END IF;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION stats_delete(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), message_length int)
RETURNS void AS $$
DECLARE user_id INTEGER;
DECLARE server_id INTEGER;
DECLARE channel_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	server_id := get_server_id(server_id_raw);
	channel_id := get_channel_id(channel_id_raw, server_id);
	
	INSERT INTO stats__phrases_client_d ("UID", "COUNT") VALUES (user_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_client_d."COUNT" + 1;
	INSERT INTO stats__chars_client_d ("UID", "COUNT") VALUES (user_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_client_d."COUNT" + message_length;

	INSERT INTO stats__phrases_channel_d ("UID", "COUNT") VALUES (channel_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_channel_d."COUNT" + 1;
	INSERT INTO stats__uphrases_channel_d ("UID", "CHANNEL", "COUNT") VALUES (user_id, channel_id, 1) ON CONFLICT ("UID", "CHANNEL") DO UPDATE SET "COUNT" = stats__uphrases_channel_d."COUNT" + 1;
	INSERT INTO stats__phrases_server_d ("UID", "COUNT") VALUES (server_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_server_d."COUNT" + 1;
	INSERT INTO stats__uphrases_server_d ("UID", "USERVER", "COUNT") VALUES (user_id, server_id, 1) ON CONFLICT ("UID", "USERVER") DO UPDATE SET "COUNT" = stats__uphrases_server_d."COUNT" + 1;
	
	INSERT INTO stats__chars_channel_d ("UID", "COUNT") VALUES (channel_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_channel_d."COUNT" + message_length;
	INSERT INTO stats__uchars_channel_d ("UID", "CHANNEL", "COUNT") VALUES (user_id, channel_id, message_length) ON CONFLICT ("UID", "CHANNEL") DO UPDATE SET "COUNT" = stats__uchars_channel_d."COUNT" + message_length;
	INSERT INTO stats__chars_server_d ("UID", "COUNT") VALUES (server_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_server_d."COUNT" + message_length;
	INSERT INTO stats__uchars_server_d ("UID", "USERVER", "COUNT") VALUES (user_id, server_id, message_length) ON CONFLICT ("UID", "USERVER") DO UPDATE SET "COUNT" = stats__uchars_server_d."COUNT" + message_length;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION stats_command(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), command varchar(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
DECLARE server_id INTEGER;
DECLARE channel_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	server_id := get_server_id(server_id_raw);
	channel_id := get_channel_id(channel_id_raw, server_id);
	
	INSERT INTO stats__command_client ("UID", "COMMAND", "COUNT") VALUES (user_id, command, 1) ON CONFLICT ("UID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_client."COUNT" + 1;

	INSERT INTO stats__command_channel ("UID", "COMMAND", "COUNT") VALUES (channel_id, command, 1) ON CONFLICT ("UID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_channel."COUNT" + 1;
	INSERT INTO stats__command_server ("UID", "COMMAND", "COUNT") VALUES (server_id, command, 1) ON CONFLICT ("UID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_server."COUNT" + 1;
	
	INSERT INTO stats__command_uchannel ("UID", "CHANNEL", "COMMAND", "COUNT") VALUES (user_id, channel_id, command, 1) ON CONFLICT ("UID", "COMMAND", "CHANNEL") DO UPDATE SET "COUNT" = stats__command_uchannel."COUNT" + 1;
	INSERT INTO stats__command_userver ("UID", "USERVER", "COMMAND", "COUNT") VALUES (user_id, server_id, command, 1) ON CONFLICT ("UID", "COMMAND", "USERVER") DO UPDATE SET "COUNT" = stats__command_userver."COUNT" + 1;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION stats_command(user_id_raw VARCHAR(64), command varchar(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	
	INSERT INTO stats__command_client ("UID", "COMMAND", "COUNT") VALUES (user_id, command, 1) ON CONFLICT ("UID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_client."COUNT" + 1;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION stats_delete(user_id_raw VARCHAR(64), message_length int)
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	
	INSERT INTO stats__phrases_client_d ("UID", "COUNT") VALUES (user_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_client_d."COUNT" + 1;
	INSERT INTO stats__chars_client_d ("UID", "COUNT") VALUES (user_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_client_d."COUNT" + message_length;
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION user_status_heartbeat(cTime int)
RETURNS void AS $$
BEGIN
	UPDATE lastonline SET "LASTONLINE" = cTime FROM user_status WHERE user_status."ID" = lastonline."ID" AND user_status."STATUS" != 'offline';
	
	UPDATE uptime SET "TOTAL_ONLINE" = "TOTAL_ONLINE" + 5 FROM user_status WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" != 'offline';
	UPDATE uptime SET "ONLINE" = "ONLINE" + 5 FROM user_status WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" = 'online';
	UPDATE uptime SET "AWAY" = "AWAY" + 5 FROM user_status WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" = 'idle';
	UPDATE uptime SET "DNT" = "DNT" + 5 FROM user_status WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" = 'dnd';
	UPDATE uptime SET "TOTAL_OFFLINE" = "TOTAL_OFFLINE" + 5 FROM user_status WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" = 'offline';
END; $$ LANGUAGE plpgsql;

CREATE FUNCTION update_nicknames_stats(cTime int)
RETURNS void AS $$
DECLARE my_row RECORD;
BEGIN
	FOR my_row IN (SELECT * FROM member_names) LOOP
		EXECUTE format('INSERT INTO name_logs ("MEMBER", "NAME", "LASTUSE", "TIME") VALUES (%L, %L, %L, 10) ON CONFLICT ("MEMBER", "NAME") DO UPDATE SET "LASTUSE" = %L, "TIME" = name_logs."TIME" + 10;', my_row."ID", my_row."NAME", cTime, cTime);
	END LOOP;
END; $$ LANGUAGE plpgsql;

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

