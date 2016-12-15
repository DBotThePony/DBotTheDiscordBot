
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discord_user_status') THEN
		CREATE TYPE discord_user_status AS ENUM ('online', 'idle', 'dnd', 'offline');
	END IF;
	
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rgb_color') THEN
		CREATE TYPE rgb_color AS (red SMALLINT, green SMALLINT, blue SMALLINT);
	END IF;
	
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discord_realm') THEN
		CREATE TYPE discord_realm AS ENUM ('client', 'channel', 'server');
	END IF;
	
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'discord_permission') THEN
		CREATE TYPE discord_permission AS ENUM (
			'CREATE_INSTANT_INVITE',
			'KICK_MEMBERS',
			'BAN_MEMBERS',
			'ADMINISTRATOR',
			'MANAGE_CHANNELS',
			'MANAGE_GUILD',
			'MANAGE_WEBHOOKS',
			'MANAGE_EMOJIS',
			'READ_MESSAGES',
			'SEND_MESSAGES',
			'SEND_TTS_MESSAGES',
			'MANAGE_MESSAGES',
			'EMBED_LINKS',
			'ATTACH_FILES',
			'READ_MESSAGE_HISTORY',
			'MENTION_EVERYONE',
			'EXTERNAL_EMOJIS', -- use external emojis
			'CONNECT', -- connect to voice
			'SPEAK', -- speak on voice
			'MUTE_MEMBERS', -- globally mute members on voice
			'DEAFEN_MEMBERS', -- globally deafen members on voice
			'MOVE_MEMBERS', -- move member's voice channels
			'USE_VAD', -- use voice activity detection
			'CHANGE_NICKNAME',
			'MANAGE_NICKNAMES', -- change nicknames of others
			'MANAGE_ROLES_OR_PERMISSIONS'
		);
	END IF;
END
$$;

CREATE OR REPLACE FUNCTION currtime()
RETURNS INTEGER AS $$
BEGIN
	return floor(extract(epoch from now()));
END; $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS font_ids (
	"ID" SERIAL PRIMARY KEY,
	"FONT" VARCHAR(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS mfortune (
	"ID" SERIAL PRIMARY KEY,
	"TEXT" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS font_sizes (
	"ID" INTEGER NOT NULL,
	"CHAR" CHAR(4) NOT NULL,
	"WIDTH" SMALLINT NOT NULL,
	PRIMARY KEY ("ID", "CHAR")
);

CREATE TABLE IF NOT EXISTS font_height (
	"ID" SERIAL PRIMARY KEY,
	"HEIGHT" SMALLINT NOT NULL
);

CREATE TABLE IF NOT EXISTS channel_id (
	"ID" SERIAL PRIMARY KEY,
	"UID" char(64) NOT NULL,
	"SID" INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS "channel_id_UID"
	ON channel_id USING btree ("UID");

CREATE TABLE IF NOT EXISTS channel_names (
	"ID" INTEGER NOT NULL PRIMARY KEY,
	"NAME" VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS command_bans_channel (
	"UID" INTEGER NOT NULL,
	"COMMAND" VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS command_bans_server (
	"UID" INTEGER NOT NULL,
	"COMMAND" VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS command_bans_member (
	"UID" INTEGER NOT NULL,
	"COMMAND" VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS command_banned_member (
	"UID" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS command_banned_cmember (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS complains (
	"ID" SERIAL PRIMARY KEY,
	"SERVER" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"USER" INTEGER NOT NULL,
	"STAMP" INTEGER NOT NULL,
	"CONTENT" text NOT NULL
);

CREATE TABLE IF NOT EXISTS cvar_channel (
	"ID" INTEGER,
	"CVAR" VARCHAR(64) NOT NULL,
	"VALUE" VARCHAR(4095) NOT NULL,
	PRIMARY KEY ("ID", "CVAR")
);

CREATE TABLE IF NOT EXISTS cvar_client (
	"ID" INTEGER,
	"CVAR" VARCHAR(64) NOT NULL,
	"VALUE" VARCHAR(4095) NOT NULL,
	PRIMARY KEY ("ID", "CVAR")
);

CREATE TABLE IF NOT EXISTS cvar_server (
	"ID" INTEGER,
	"CVAR" VARCHAR(64) NOT NULL,
	"VALUE" VARCHAR(4095) NOT NULL,
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
	"PHRASE" VARCHAR(255) NOT NULL,
	"VALUE" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS joinleft_log (
	"ID" SERIAL PRIMARY KEY,
	"USER" INTEGER NOT NULL,
	"SERVER" INTEGER NOT NULL,
	"STAMP" INTEGER NOT NULL,
	"STATUS" boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS lastonline (
	"ID" SERIAL PRIMARY KEY,
	"LASTONLINE" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS meme_cache (
	"ID" SERIAL PRIMARY KEY,
	"URL" VARCHAR(64) NOT NULL,
	"NAME" VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS uname_logs (
	"USER" INTEGER NOT NULL,
	"NAME" VARCHAR(255) NOT NULL,
	"LASTUSE" INTEGER NOT NULL,
	"TIME" double precision NOT NULL,
	PRIMARY KEY ("USER", "NAME")
);

CREATE TABLE IF NOT EXISTS server_id (
	"ID" SERIAL PRIMARY KEY,
	"UID" char(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS "server_id_UID"
	ON server_id USING btree ("UID");

CREATE TABLE IF NOT EXISTS server_names (
	"ID" INTEGER NOT NULL PRIMARY KEY,
	"NAME" VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS stats__chars_channel (
	"UID" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_channel_d (
	"UID" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_client (
	"UID" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_client_d (
	"UID" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_server (
	"UID" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__chars_server_d (
	"UID" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__command_channel (
	"UID" INTEGER NOT NULL,
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_client (
	"UID" INTEGER NOT NULL,
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_server (
	"UID" INTEGER NOT NULL,
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_uchannel (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_userver (
	"UID" INTEGER NOT NULL,
	"USERVER" INTEGER NOT NULL,
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "USERVER", "COMMAND")
);

CREATE TABLE IF NOT EXISTS off_users (
	"ID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	PRIMARY KEY ("ID", "CHANNEL")
)

CREATE TABLE IF NOT EXISTS stats__images_channel (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__images_client (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__images_server (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_channel (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_channel_d (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_channel_e (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_client (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_client_d (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_client_e (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_server (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_server_d (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__phrases_server_e (
	"UID" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID")
);

CREATE TABLE IF NOT EXISTS stats__uchars_channel (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uchars_channel_d (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uchars_server (
	"UID" INTEGER NOT NULL,
	"USERVER" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uchars_server_d (
	"UID" INTEGER NOT NULL,
	"USERVER" INTEGER NOT NULL,
	"COUNT" bigint NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uimages_channel (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

-- NUMBER is 1000 multipler
CREATE TABLE IF NOT EXISTS stats__channel_get_image (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"NUMBER" INTEGER NOT NULL,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE OR REPLACE FUNCTION stats_trigger_get_channel_image()
RETURNS TRIGGER as $$
DECLARE curr INTEGER;
BEGIN
	SELECT stats__images_channel."COUNT" INTO curr FROM stats__images_channel WHERE stats__images_channel."UID" = NEW."CHANNEL";
	
	IF (curr % 100 = 0 AND curr > 0) THEN
		INSERT INTO
			stats__channel_get_image
			("MEMBER", "CHANNEL", "NUMBER")
		VALUES
			(get_member_id_soft(NEW."UID", get_server_from_channel(NEW."CHANNEL")), NEW."CHANNEL", floor(curr / 100));
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS get_log ON stats__uimages_channel;
DROP TRIGGER IF EXISTS get_log_insert ON stats__uimages_channel;

CREATE TRIGGER get_log
	AFTER UPDATE ON stats__uimages_channel FOR EACH ROW 
	EXECUTE PROCEDURE stats_trigger_get_channel_image();

CREATE TRIGGER get_log_insert
	AFTER INSERT ON stats__uimages_channel FOR EACH ROW 
	EXECUTE PROCEDURE stats_trigger_get_channel_image();


CREATE TABLE IF NOT EXISTS stats__uimages_server (
	"UID" INTEGER NOT NULL,
	"USERVER" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

-- NUMBER is 1000 multipler
CREATE TABLE IF NOT EXISTS stats__server_get_image (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL,
	"NUMBER" INTEGER NOT NULL,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE OR REPLACE FUNCTION stats_trigger_get_image()
RETURNS TRIGGER as $$
DECLARE curr INTEGER;
BEGIN
	SELECT stats__images_server."COUNT" INTO curr FROM stats__images_server WHERE stats__images_server."UID" = NEW."USERVER";
	
	IF (curr % 100 = 0 AND curr > 0) THEN
		INSERT INTO stats__server_get_image ("MEMBER", "NUMBER") VALUES (get_member_id_soft(NEW."UID", NEW."USERVER"), floor(curr / 100));
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS get_log ON stats__uimages_server;
DROP TRIGGER IF EXISTS get_log_insert ON stats__uimages_server;

CREATE TRIGGER get_log
	AFTER UPDATE ON stats__uimages_server FOR EACH ROW 
	EXECUTE PROCEDURE stats_trigger_get_image();

CREATE TRIGGER get_log_insert
	AFTER INSERT ON stats__uimages_server FOR EACH ROW 
	EXECUTE PROCEDURE stats_trigger_get_image();


CREATE TABLE IF NOT EXISTS stats__uphrases_channel (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

-- NUMBER is 1000 multipler
CREATE TABLE IF NOT EXISTS stats__channel_get (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"NUMBER" INTEGER NOT NULL,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE OR REPLACE FUNCTION stats_trigger_get_channel()
RETURNS TRIGGER as $$
DECLARE curr INTEGER;
BEGIN
	SELECT stats__phrases_channel."COUNT" INTO curr FROM stats__phrases_channel WHERE stats__phrases_channel."UID" = NEW."CHANNEL";
	
	IF (curr % 1000 = 0 AND curr > 0) THEN
		INSERT INTO
			stats__channel_get
			("MEMBER", "CHANNEL", "NUMBER")
		VALUES
			(get_member_id_soft(NEW."UID", get_server_from_channel(NEW."CHANNEL")), NEW."CHANNEL", floor(curr / 1000));
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS get_log ON stats__uphrases_channel;
DROP TRIGGER IF EXISTS get_log_insert ON stats__uphrases_channel;

CREATE TRIGGER get_log
	AFTER UPDATE ON stats__uphrases_channel FOR EACH ROW 
	EXECUTE PROCEDURE stats_trigger_get_channel();

CREATE TRIGGER get_log_insert
	AFTER INSERT ON stats__uphrases_channel FOR EACH ROW 
	EXECUTE PROCEDURE stats_trigger_get_channel();


CREATE TABLE IF NOT EXISTS stats__uphrases_channel_d (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_channel_e (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_server (
	"UID" INTEGER NOT NULL,
	"USERVER" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

-- NUMBER is 1000 multipler
CREATE TABLE IF NOT EXISTS stats__server_get (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL,
	"NUMBER" INTEGER NOT NULL,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE OR REPLACE FUNCTION stats_trigger_get()
RETURNS TRIGGER as $$
DECLARE curr INTEGER;
BEGIN
	SELECT stats__phrases_server."COUNT" INTO curr FROM stats__phrases_server WHERE stats__phrases_server."UID" = NEW."USERVER";
	
	IF (curr % 1000 = 0 AND curr > 0) THEN
		INSERT INTO stats__server_get ("MEMBER", "NUMBER") VALUES (get_member_id_soft(NEW."UID", NEW."USERVER"), floor(curr / 1000));
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS get_log ON stats__uphrases_server;
DROP TRIGGER IF EXISTS get_log_insert ON stats__uphrases_server;

CREATE TRIGGER get_log
	AFTER UPDATE ON stats__uphrases_server FOR EACH ROW 
	EXECUTE PROCEDURE stats_trigger_get();

CREATE TRIGGER get_log_insert
	AFTER INSERT ON stats__uphrases_server FOR EACH ROW 
	EXECUTE PROCEDURE stats_trigger_get();

CREATE TABLE IF NOT EXISTS stats__uphrases_server_d (
	"UID" INTEGER NOT NULL,
	"USERVER" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uphrases_server_e (
	"UID" INTEGER NOT NULL,
	"USERVER" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__uwords_channel (
	"UID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	"WORD" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "WORD", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uwords_server (
	"UID" INTEGER NOT NULL,
	"USERVER" INTEGER NOT NULL,
	"WORD" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "WORD", "USERVER")
);

CREATE TABLE IF NOT EXISTS stats__words_channel (
	"UID" INTEGER NOT NULL,
	"WORD" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "WORD")
);

CREATE TABLE IF NOT EXISTS stats__words_client (
	"UID" INTEGER NOT NULL,
	"WORD" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "WORD")
);

CREATE TABLE IF NOT EXISTS stats__words_server (
	"UID" INTEGER NOT NULL,
	"WORD" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL,
	PRIMARY KEY ("UID", "WORD")
);

CREATE TABLE IF NOT EXISTS steam_emoji_fail (
	"EMOJI" VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS steamid (
	"STEAMID64" char(64) NOT NULL,
	"STEAMID" char(32) NOT NULL,
	"STEAMID3" char(32) NOT NULL,
	"CUSTOMID" VARCHAR(128) NOT NULL,
	PRIMARY KEY ("STEAMID64")
);

CREATE TABLE IF NOT EXISTS steamid_fail (
	"STEAMID64" char(64) DEFAULT NULL,
	"STEAMID" char(32) DEFAULT NULL,
	"STEAMID3" char(32) DEFAULT NULL,
	"CUSTOMID" VARCHAR(128) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS timers_ids (
	"ID" SERIAL PRIMARY KEY,
	"TITLE" VARCHAR(128) NOT NULL,
	"HASH" VARCHAR(64) NOT NULL,
	"NOTIFY" boolean NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS timers_users (
	"ID" INTEGER NOT NULL,
	"TIMERID" INTEGER NOT NULL,
	PRIMARY KEY ("ID", "TIMERID")
);

CREATE TABLE IF NOT EXISTS uptime (
	"ID" INTEGER NOT NULL,
	"TOTAL_ONLINE" double precision NOT NULL DEFAULT 0,
	"TOTAL_OFFLINE" double precision NOT NULL DEFAULT 0,
	"ONLINE" double precision NOT NULL DEFAULT 0,
	"AWAY" double precision NOT NULL DEFAULT 0,
	"DNT" double precision NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL,
	PRIMARY KEY ("ID")
);

CREATE TABLE IF NOT EXISTS user_status (
	"ID" INTEGER NOT NULL,
	"STATUS" discord_user_status NOT NULL,
	PRIMARY KEY ("ID")
);

CREATE TABLE IF NOT EXISTS uptime_bot (
	"START" INTEGER NOT NULL,
	"AMOUNT" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS urbancache (
	"WORD" VARCHAR(64) NOT NULL,
	"DEFINITION" text NOT NULL,
	"TAGS" VARCHAR(512) NOT NULL,
	"ULINK" VARCHAR(64) NOT NULL,
	"DEXAMPLE" text NOT NULL,
	"USTAMP" INTEGER NOT NULL,
	PRIMARY KEY ("WORD")
);

CREATE TABLE IF NOT EXISTS user_id (
	"ID" SERIAL PRIMARY KEY,
	"UID" char(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS "user_id_UID"
	ON user_id USING btree ("UID");

CREATE TABLE IF NOT EXISTS last_seen (
	"ID" INTEGER PRIMARY KEY,
	"TIME" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS user_names (
	"ID" INTEGER NOT NULL,
	"USERNAME" VARCHAR(64) NOT NULL,
	PRIMARY KEY ("ID")
);

CREATE TABLE IF NOT EXISTS users_roles (
	"USERID" INTEGER NOT NULL,
	"ROLEID" INTEGER NOT NULL,
	PRIMARY KEY ("USERID", "ROLEID")
);

CREATE TABLE IF NOT EXISTS votes_choices (
	"VOTE" INTEGER NOT NULL,
	"CHOICEID" INTEGER NOT NULL,
	"NAME" VARCHAR(64) NOT NULL,
	"VOTES" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("VOTE", "CHOICEID")
);

CREATE TABLE IF NOT EXISTS votes_list (
	"ID" SERIAL PRIMARY KEY,
	"SERVER" INTEGER NOT NULL,
	"CHANNEL" INTEGER DEFAULT NULL,
	"NAME" VARCHAR(64) NOT NULL,
	"STAMP" INTEGER NOT NULL,
	"CLOSED" boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS votes_text (
	"ID" INTEGER NOT NULL,
	"TEXT" text NOT NULL,
	PRIMARY KEY ("ID")
);

CREATE TABLE IF NOT EXISTS votes_votes (
	"VOTE" INTEGER NOT NULL,
	"USER" INTEGER NOT NULL,
	"CHOICE" INTEGER NOT NULL,
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

CREATE TABLE IF NOT EXISTS member_names (
	"ID" INTEGER PRIMARY KEY,
	"NAME" VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS name_logs (
	"MEMBER" INTEGER NOT NULL,
	"NAME" VARCHAR(255) NOT NULL,
	"LASTUSE" INTEGER NOT NULL,
	"TIME" double precision NOT NULL,
	PRIMARY KEY ("MEMBER", "NAME")
);

CREATE TABLE IF NOT EXISTS name_logs_list (
	"ID" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL,
	"OLD" VARCHAR(255) NOT NULL,
	"NEW" VARCHAR(255) NOT NULL,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE OR REPLACE FUNCTION member_name_trigger()
RETURNS TRIGGER as $$
BEGIN
	INSERT INTO name_logs VALUES(NEW."ID", NEW."NAME", floor(extract(epoch from now())), 0) ON CONFLICT DO NOTHING;
	
	IF (OLD."NAME" != NEW."NAME") THEN
		INSERT INTO name_logs_list ("MEMBER", "OLD", "NEW") VALUES (NEW."ID", OLD."NAME", NEW."NAME");
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION member_name_trigger2()
RETURNS TRIGGER as $$
BEGIN
	INSERT INTO name_logs VALUES(NEW."ID", NEW."NAME", floor(extract(epoch from now())), 0) ON CONFLICT DO NOTHING;
	INSERT INTO name_logs_list ("MEMBER", "OLD", "NEW") VALUES (NEW."ID", NEW."NAME", NEW."NAME");
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_name_log ON member_names;
DROP TRIGGER IF EXISTS member_name_log2 ON member_names;

CREATE TRIGGER member_name_log
	AFTER UPDATE ON member_names FOR EACH ROW 
	EXECUTE PROCEDURE member_name_trigger();

CREATE TRIGGER member_name_log2
	AFTER INSERT ON member_names FOR EACH ROW 
	EXECUTE PROCEDURE member_name_trigger2();
	
-- Roles

CREATE TABLE IF NOT EXISTS roles_log (
	"ID" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL,
	"ROLE" INTEGER NOT NULL,
	"TYPE" BOOLEAN NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_id (
	"ID" SERIAL PRIMARY KEY,
	"SERVER" INTEGER NOT NULL,
	"UID" char(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_perms (
	"ID" INTEGER PRIMARY KEY,
	"PERMS" discord_permission[]
);

CREATE TABLE IF NOT EXISTS roles_options (
	"ID" INTEGER PRIMARY KEY,
	"COLOR_R" rgb_color NOT NULL,
	"HOIST" BOOLEAN NOT NULL,
	"POSITION" SMALLINT NOT NULL,
	"MENTION" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_changes_perms (
	"ID" SERIAL PRIMARY KEY,
	"ROLEID" INTEGER NOT NULL,
	"PERM" discord_permission NOT NULL,
	"TYPE" BOOLEAN NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_changes_color (
	"ID" SERIAL PRIMARY KEY,
	"ROLEID" INTEGER,
	"OLD" rgb_color NOT NULL,
	"NEW" rgb_color NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_changes_position (
	"ID" SERIAL PRIMARY KEY,
	"ROLEID" INTEGER,
	"OLD" SMALLINT NOT NULL,
	"NEW" SMALLINT NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_changes_hoist (
	"ID" SERIAL PRIMARY KEY,
	"ROLEID" INTEGER,
	"OLD" BOOLEAN NOT NULL,
	"NEW" BOOLEAN NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS roles_changes_mention (
	"ID" SERIAL PRIMARY KEY,
	"ROLEID" INTEGER,
	"OLD" BOOLEAN NOT NULL,
	"NEW" BOOLEAN NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tags_list (
	"UID" INTEGER NOT NULL,
	"REALM" discord_realm NOT NULL,
	"SPACE" VARCHAR(64) NOT NULL,
	"TAG" VARCHAR(128)[] NOT NULL,
	PRIMARY KEY ("UID", "REALM", "SPACE")
);

CREATE TABLE IF NOT EXISTS tags_defbans (
	"SPACE" VARCHAR(64) NOT NULL,
	"TAG" VARCHAR(128)[] NOT NULL,
	PRIMARY KEY ("SPACE")
);

CREATE TABLE IF NOT EXISTS tags_init (
	"UID" INTEGER NOT NULL,
	"REALM" discord_realm NOT NULL,
	"SPACE" VARCHAR(64) NOT NULL,
	PRIMARY KEY ("UID", "SPACE", "REALM")
);

CREATE OR REPLACE FUNCTION init_tags()
RETURNS void AS $$
BEGIN
	WITH valid AS (
		SELECT
			last_seen."ID"
		FROM
			last_seen
		WHERE
			last_seen."TIME" > currtime() - 120
	)
	
	INSERT INTO
		tags_list
		SELECT
			valid."ID",
			'client' AS "REALM",
			tags_defbans."SPACE",
			tags_defbans."TAG"
		FROM
			valid,
			tags_defbans
		WHERE NOT EXISTS (
			SELECT
				1 AS "RESULT"
			FROM
				tags_init
			WHERE
				valid."ID" = tags_init."UID" AND
				tags_init."REALM" = 'client' AND
				tags_init."SPACE" = tags_defbans."SPACE"
		);
	
	WITH valid AS (
		SELECT
			last_seen."ID"
		FROM
			last_seen
		WHERE
			last_seen."TIME" > currtime() - 120
	)
	
	INSERT INTO
		tags_init
		SELECT
			valid."ID",
			'client' AS "REALM",
			tags_defbans."SPACE"
		FROM
			valid,
			tags_defbans
		WHERE NOT EXISTS (
			SELECT
				1 AS "RESULT"
			FROM
				tags_init
			WHERE
				valid."ID" = tags_init."UID" AND
				tags_init."REALM" = 'client' AND
				tags_init."SPACE" = tags_defbans."SPACE"
		) GROUP BY
			valid."ID",
			tags_defbans."SPACE"
	ON CONFLICT DO NOTHING;
			
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION roles_logger_trigger()
RETURNS TRIGGER AS $$
DECLARE curr_time INTEGER;
BEGIN
	curr_time := floor(extract(epoch from now()));
	
	IF (OLD."COLOR_R" != NEW."COLOR_R") THEN
		INSERT INTO roles_changes_color ("ROLEID", "OLD", "NEW", "STAMP") VALUES (NEW."ID", OLD."COLOR_R", NEW."COLOR_R", curr_time);
	END IF;
	
	IF (OLD."POSITION" != NEW."POSITION") THEN
		INSERT INTO roles_changes_position ("ROLEID", "OLD", "NEW", "STAMP") VALUES (NEW."ID", OLD."POSITION", NEW."POSITION", curr_time);
	END IF;
	
	IF (OLD."HOIST" != NEW."HOIST") THEN
		INSERT INTO roles_changes_hoist ("ROLEID", "OLD", "NEW", "STAMP") VALUES (NEW."ID", OLD."HOIST", NEW."HOIST", curr_time);
	END IF;
	
	IF (OLD."MENTION" != NEW."MENTION") THEN
		INSERT INTO roles_changes_mention ("ROLEID", "OLD", "NEW", "STAMP") VALUES (NEW."ID", OLD."MENTION", NEW."MENTION", curr_time);
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION roles_logger_trigger2()
RETURNS TRIGGER AS $$
DECLARE curr_time INTEGER;
DECLARE hit BOOLEAN;
DECLARE perm discord_permission;
DECLARE perm2 discord_permission;
BEGIN
	curr_time := floor(extract(epoch from now()));
	hit := false;
	
	FOREACH perm IN ARRAY OLD."PERMS" LOOP
		hit := false;
		
		FOREACH perm2 IN ARRAY NEW."PERMS" LOOP
			IF (perm = perm2) THEN
				hit := true;
				EXIT;
			END IF;
		END LOOP;
		
		IF (NOT hit) THEN
			INSERT INTO roles_changes_perms ("ROLEID", "PERM", "TYPE", "STAMP") VALUES (NEW."ID", perm, false, curr_time);
		END IF;
	END LOOP;
	
	FOREACH perm IN ARRAY NEW."PERMS" LOOP
		hit := false;
		
		FOREACH perm2 IN ARRAY OLD."PERMS" LOOP
			IF (perm = perm2) THEN
				hit := true;
				EXIT;
			END IF;
		END LOOP;
		
		IF (NOT hit) THEN
			INSERT INTO roles_changes_perms ("ROLEID", "PERM", "TYPE", "STAMP") VALUES (NEW."ID", perm, true, curr_time);
		END IF;
	END LOOP;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roles_logging ON roles_options;

CREATE TRIGGER roles_logging
	AFTER UPDATE ON roles_options FOR EACH ROW 
	EXECUTE PROCEDURE roles_logger_trigger();

DROP TRIGGER IF EXISTS roles_logging ON roles_perms;

CREATE TRIGGER roles_logging
	AFTER UPDATE ON roles_perms FOR EACH ROW 
	EXECUTE PROCEDURE roles_logger_trigger2();


CREATE TABLE IF NOT EXISTS killicons (
	"ID" SERIAL PRIMARY KEY,
	"NAME" VARCHAR(64) NOT NULL,
	"FILENAME" VARCHAR(64) NOT NULL,
	"CLASSNAME" VARCHAR(64) NOT NULL,
	"WIDTH" INTEGER NOT NULL,
	"HEIGHT" INTEGER NOT NULL
);

CREATE OR REPLACE FUNCTION uptdate_last_seen(user_ids INTEGER[], cTime INTEGER)
RETURNS void AS $$
BEGIN
	UPDATE last_seen SET "TIME" = cTime WHERE "ID" = ANY(user_ids);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_hit(user_id_raw VARCHAR(64), message_length INTEGER, words VARCHAR(64)[], images_seneded INTEGER)
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

CREATE OR REPLACE FUNCTION stats_edit(user_id_raw VARCHAR(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	
	INSERT INTO stats__phrases_client_e ("UID", "COUNT") VALUES (user_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_client_e."COUNT" + 1;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_edit(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64))
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

CREATE OR REPLACE FUNCTION stats_hit(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), message_length INTEGER, words VARCHAR(64)[], images_seneded INTEGER)
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

CREATE OR REPLACE FUNCTION stats_delete(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), message_length INTEGER)
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

CREATE OR REPLACE FUNCTION stats_command(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), command VARCHAR(64))
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

CREATE OR REPLACE FUNCTION stats_command(user_id_raw VARCHAR(64), command VARCHAR(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	
	INSERT INTO stats__command_client ("UID", "COMMAND", "COUNT") VALUES (user_id, command, 1) ON CONFLICT ("UID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_client."COUNT" + 1;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_delete(user_id_raw VARCHAR(64), message_length INTEGER)
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	
	INSERT INTO stats__phrases_client_d ("UID", "COUNT") VALUES (user_id, 1) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__phrases_client_d."COUNT" + 1;
	INSERT INTO stats__chars_client_d ("UID", "COUNT") VALUES (user_id, message_length) ON CONFLICT ("UID") DO UPDATE SET "COUNT" = stats__chars_client_d."COUNT" + message_length;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION user_status_heartbeat(cTime INTEGER)
RETURNS void AS $$
BEGIN
	UPDATE lastonline SET "LASTONLINE" = cTime FROM user_status, last_seen WHERE user_status."ID" = lastonline."ID" AND user_status."STATUS" != 'offline' AND last_seen."ID" = lastonline."ID" AND last_seen."TIME" > cTime - 120;
	
	UPDATE uptime SET "TOTAL_ONLINE" = "TOTAL_ONLINE" + 5 FROM user_status, last_seen WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" != 'offline' AND last_seen."ID" = uptime."ID" AND last_seen."TIME" > cTime - 120;
	UPDATE uptime SET "ONLINE" = "ONLINE" + 5 FROM user_status, last_seen WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" = 'online' AND last_seen."ID" = uptime."ID" AND last_seen."TIME" > cTime - 120;
	UPDATE uptime SET "AWAY" = "AWAY" + 5 FROM user_status, last_seen WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" = 'idle' AND last_seen."ID" = uptime."ID" AND last_seen."TIME" > cTime - 120;
	UPDATE uptime SET "DNT" = "DNT" + 5 FROM user_status, last_seen WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" = 'dnd' AND last_seen."ID" = uptime."ID" AND last_seen."TIME" > cTime - 120;
	UPDATE uptime SET "TOTAL_OFFLINE" = "TOTAL_OFFLINE" + 5 FROM user_status, last_seen WHERE user_status."ID" = uptime."ID" AND user_status."STATUS" = 'offline' AND last_seen."ID" = uptime."ID" AND last_seen."TIME" > cTime - 120;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_nicknames_stats(cTime INTEGER)
RETURNS void AS $$
DECLARE my_row RECORD;
DECLARE my_time INTEGER;
BEGIN
	UPDATE
		name_logs
	SET
		"LASTUSE" = cTime,
		"TIME" = name_logs."TIME" + 10
	FROM
		member_names,
		last_seen,
		member_id
	WHERE
		member_names."ID" = member_id."ID" AND
		member_id."USER" = last_seen."ID" AND
		last_seen."TIME" > cTime - 120 AND
		name_logs."MEMBER" = member_id."ID" AND
		name_logs."NAME" = member_names."NAME";
	
	UPDATE
		uname_logs
	SET
		"LASTUSE" = cTime,
		"TIME" = uname_logs."TIME" + 10
	FROM
		user_names,
		last_seen
	WHERE
		user_names."ID" = last_seen."ID" AND
		last_seen."TIME" > cTime - 120 AND
		uname_logs."USER" = user_names."ID" AND
		uname_logs."NAME" = user_names."USERNAME";
		
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_role_id_combined(fUID VARCHAR(64), fSERVER2 VARCHAR(64))
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

CREATE OR REPLACE FUNCTION get_role_id(fUID VARCHAR(64), fSERVER INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "roles_id"."ID" INTO last_id FROM "roles_id" WHERE "roles_id"."UID" = fUID AND "roles_id"."SERVER" = fSERVER;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "roles_id" ("SERVER", "UID") VALUES (fSERVER, fUID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_font_id(fName VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "font_ids"."ID" INTO last_id FROM "font_ids" WHERE "font_ids"."FONT" = fName;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "font_ids" ("FONT") VALUES (fName) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_channel_id(fUID VARCHAR(64), sID INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "channel_id"."ID" INTO last_id FROM "channel_id" WHERE "channel_id"."UID" = fUID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "channel_id" ("UID", "SID") VALUES (fUID, sID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_server_from_channel(sID INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "channel_id"."SID" INTO last_id FROM "channel_id" WHERE "channel_id"."ID" = sID;
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_server_id(sID VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "server_id"."ID" INTO last_id FROM "server_id" WHERE "server_id"."UID" = sID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "server_id" ("UID") VALUES (sID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_servers_id(sID CHAR(64)[])
RETURNS TABLE ("ID" INTEGER, "UID" VARCHAR(64)) AS $$
BEGIN
	WITH missing_tab AS (
		WITH missing AS (
			SELECT
				UNNEST(sID) AS "MISSING"
		)
		
		SELECT
			missing."MISSING"
		FROM
			missing
		WHERE NOT EXISTS (
			SELECT
				missing."MISSING"
			FROM
				server_id
			WHERE
				missing."MISSING" = server_id."UID"
		)
	)
	
	INSERT INTO "server_id" ("UID") SELECT * FROM missing_tab WHERE missing_tab."MISSING" IS NOT NULL;
	
	RETURN QUERY SELECT server_id."ID", TRIM(server_id."UID")::VARCHAR(64) FROM server_id WHERE server_id."UID" = ANY (sID);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_users_id(sID CHAR(64)[])
RETURNS TABLE ("ID" INTEGER, "UID" VARCHAR(64)) AS $$
BEGIN
	WITH missing_tab AS (
		WITH missing AS (
			SELECT
				UNNEST(sID) AS "MISSING"
		)
		
		SELECT
			missing."MISSING"
		FROM
			missing
		WHERE NOT EXISTS (
			SELECT
				missing."MISSING"
			FROM
				user_id
			WHERE
				missing."MISSING" = user_id."UID"
		)
	)
	
	INSERT INTO "user_id" ("UID") SELECT * FROM missing_tab WHERE missing_tab."MISSING" IS NOT NULL;
	
	RETURN QUERY SELECT user_id."ID", TRIM(user_id."UID")::VARCHAR(64) FROM user_id WHERE user_id."UID" = ANY (sID);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_channels_id(sID CHAR(64)[], sID2 INTEGER[])
RETURNS TABLE ("ID" INTEGER, "UID" VARCHAR(64)) AS $$
BEGIN
	WITH missing_tab AS (
		WITH missing AS (
			SELECT
				UNNEST(sID) AS "MISSING_CHANNEL",
				UNNEST(sID2) AS "MISSING_SERVER"
		)
		
		SELECT
			missing."MISSING_CHANNEL",
			missing."MISSING_SERVER"
		FROM
			missing
		WHERE NOT EXISTS (
			SELECT
				missing."MISSING_CHANNEL",
				missing."MISSING_SERVER"
			FROM
				channel_id
			WHERE
				missing."MISSING_CHANNEL" = channel_id."UID" AND
				missing."MISSING_SERVER" = channel_id."SID"
		)
	)
	
	INSERT INTO "channel_id" ("UID", "SID") SELECT * FROM missing_tab WHERE missing_tab."MISSING_CHANNEL" IS NOT NULL;
	
	RETURN QUERY SELECT channel_id."ID", TRIM(channel_id."UID")::VARCHAR(64) FROM channel_id WHERE channel_id."UID" = ANY (sID);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_members_id(sID INTEGER[], sID2 INTEGER[])
RETURNS TABLE ("ID" INTEGER, "USER" INTEGER, "SERVER" INTEGER) AS $$
BEGIN
	WITH missing_tab AS (
		WITH missing AS (
			SELECT
				UNNEST(sID) AS "MISSING_USER",
				UNNEST(sID2) AS "MISSING_SERVER"
		)
		
		SELECT
			missing."MISSING_USER",
			missing."MISSING_SERVER"
		FROM
			missing
		WHERE NOT EXISTS (
			SELECT
				missing."MISSING_USER",
				missing."MISSING_SERVER"
			FROM
				member_id
			WHERE
				missing."MISSING_USER" = member_id."USER" AND
				missing."MISSING_SERVER" = member_id."SERVER"
		)
	)
	
	INSERT INTO "member_id" ("USER", "SERVER") SELECT * FROM missing_tab WHERE missing_tab."MISSING_USER" IS NOT NULL AND missing_tab."MISSING_SERVER" IS NOT NULL;
	
	RETURN QUERY SELECT member_id."ID", member_id."USER", member_id."SERVER" FROM member_id WHERE member_id."USER" = ANY (sID) AND member_id."SERVER" = ANY (sID2);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_id(sID VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "user_id"."ID" INTO last_id FROM "user_id" WHERE "user_id"."UID" = sID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "user_id" ("UID") VALUES (sID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_member_id(userid VARCHAR(64), server VARCHAR(64))
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

CREATE OR REPLACE FUNCTION get_member_id_soft(usr_internal_id INTEGER, ser_internal_id INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "member_id"."ID" INTO last_id FROM "member_id" WHERE "member_id"."USER" = usr_internal_id AND "member_id"."SERVER" = ser_internal_id;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "member_id" ("USER", "SERVER") VALUES (usr_internal_id, ser_internal_id) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_member_id(memberid INTEGER)
RETURNS INTEGER AS $$
DECLARE to_return INTEGER;
BEGIN
	SELECT "member_id"."USER" INTO to_return FROM "member_id" WHERE "member_id"."ID" = memberid;
	RETURN to_return;
END $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_member(memberid INTEGER)
RETURNS VARCHAR(64) as $$
DECLARE iuid INTEGER;
BEGIN
	iuid := restore_member_id(memberid);
	
	RETURN (SELECT "user_id"."UID" FROM "user_id" WHERE "user_id"."ID" = iuid);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_get_rank(userid INTEGER)
RETURNS INTEGER as $$
DECLARE urank INTEGER;
DECLARE psaid INTEGER;
BEGIN
	SELECT "COUNT" INTO psaid FROM stats__phrases_client WHERE "UID" = userid;
	
	SELECT
		COUNT(*) INTO urank
	FROM
		stats__phrases_client
	WHERE
		stats__phrases_client."COUNT" > psaid;
	
	urank = urank + 1;
	RETURN urank;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_get_rank(userid INTEGER, serverid INTEGER)
RETURNS INTEGER as $$
DECLARE urank INTEGER;
DECLARE psaid INTEGER;
BEGIN
	SELECT "COUNT" INTO psaid FROM stats__uphrases_server WHERE "UID" = userid AND "USERVER" = serverid;
	
	SELECT
		COUNT(*) INTO urank
	FROM
		stats__uphrases_server
	WHERE
		stats__uphrases_server."COUNT" > psaid AND
		"USERVER" = serverid;
	
	urank = urank + 1;
	RETURN urank;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_get_rank_channel(userid INTEGER, channel INTEGER)
RETURNS INTEGER as $$
DECLARE urank INTEGER;
DECLARE psaid INTEGER;
BEGIN
	SELECT "COUNT" INTO psaid FROM stats__uphrases_channel WHERE "UID" = userid AND "CHANNEL" = channel;
	
	SELECT
		COUNT(*) INTO urank
	FROM
		stats__uphrases_channel
	WHERE
		stats__uphrases_channel."COUNT" > psaid AND
		"CHANNEL" = channel;
	
	urank = urank + 1;
	RETURN urank;
END; $$ LANGUAGE plpgsql;
