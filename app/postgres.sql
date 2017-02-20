
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
			'MANAGE_ROLES_OR_PERMISSIONS',
			'ADD_REACTIONS' -- Add reactions to messages
		);
	END IF;
END
$$;

CREATE OR REPLACE FUNCTION currtime()
RETURNS INTEGER AS $$
BEGIN
	return floor(extract(epoch from now()));
END; $$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS db_info (
	"KEY" VARCHAR(64) NOT NULL,
	"VALUE" VARCHAR(64) NOT NULL,
	PRIMARY KEY ("KEY")
);

CREATE TABLE IF NOT EXISTS font_ids (
	"ID" SERIAL PRIMARY KEY,
	"FONT" VARCHAR(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS mfortune (
	"ID" SERIAL PRIMARY KEY,
	"TEXT" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS font_sizes_14 (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"CHAR" CHAR(4) NOT NULL,
	"WIDTH" SMALLINT NOT NULL,
	PRIMARY KEY ("ID", "CHAR")
);

CREATE TABLE IF NOT EXISTS font_sizes_24 (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"CHAR" CHAR(4) NOT NULL,
	"WIDTH" SMALLINT NOT NULL,
	PRIMARY KEY ("ID", "CHAR")
);

CREATE TABLE IF NOT EXISTS font_sizes_28 (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"CHAR" CHAR(4) NOT NULL,
	"WIDTH" SMALLINT NOT NULL,
	PRIMARY KEY ("ID", "CHAR")
);

CREATE TABLE IF NOT EXISTS font_sizes_48 (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"CHAR" CHAR(4) NOT NULL,
	"WIDTH" SMALLINT NOT NULL,
	PRIMARY KEY ("ID", "CHAR")
);

CREATE TABLE IF NOT EXISTS font_sizes_56 (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"CHAR" CHAR(4) NOT NULL,
	"WIDTH" SMALLINT NOT NULL,
	PRIMARY KEY ("ID", "CHAR")
);

CREATE TABLE IF NOT EXISTS font_sizes_72 (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"CHAR" CHAR(4) NOT NULL,
	"WIDTH" SMALLINT NOT NULL,
	PRIMARY KEY ("ID", "CHAR")
);

CREATE TABLE IF NOT EXISTS font_sizes_100 (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"CHAR" CHAR(4) NOT NULL,
	"WIDTH" SMALLINT NOT NULL,
	PRIMARY KEY ("ID", "CHAR")
);

CREATE TABLE IF NOT EXISTS font_height (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"HEIGHT" SMALLINT NOT NULL,
	"SIZE" SMALLINT NOT NULL DEFAULT 14,
	PRIMARY KEY ("ID", "SIZE")
);

CREATE TABLE IF NOT EXISTS servers (
	"ID" SERIAL PRIMARY KEY,
	"UID" VARCHAR(64) NOT NULL,
	"NAME" VARCHAR(200) NOT NULL DEFAULT '[ERRORNAME]',
	"TIME" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE IF NOT EXISTS channels (
	"ID" SERIAL PRIMARY KEY,
	"UID" VARCHAR(64) NOT NULL,
	"SID" INTEGER NOT NULL REFERENCES servers ("ID"),
	"NAME" VARCHAR(200) NOT NULL DEFAULT '[ERRORNAME]',
	"TIME" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE IF NOT EXISTS users (
	"ID" SERIAL PRIMARY KEY,
	"UID" VARCHAR(64) NOT NULL,
	"NAME" VARCHAR(200) NOT NULL DEFAULT '[ERRORNAME]',
	"TIME" INTEGER NOT NULL DEFAULT currtime(),
	"STATUS" discord_user_status NOT NULL DEFAULT 'offline'
);

CREATE INDEX IF NOT EXISTS "users_UID"
	ON users USING btree ("UID");

CREATE INDEX IF NOT EXISTS "channels_UID"
	ON channels USING btree ("UID");

CREATE INDEX IF NOT EXISTS "servers_UID"
	ON servers USING btree ("UID");

CREATE TABLE IF NOT EXISTS members (
	"ID" SERIAL PRIMARY KEY,
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"SERVER" INTEGER NOT NULL REFERENCES servers ("ID"),
	"NAME" VARCHAR(200) NOT NULL DEFAULT '[ERRORNAME]',
	"TIME" INTEGER NOT NULL DEFAULT currtime()
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

CREATE TABLE IF NOT EXISTS off_users (
	"ID" INTEGER NOT NULL,
	"CHANNEL" INTEGER NOT NULL,
	PRIMARY KEY ("ID", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__generic_users (
	"ID" INTEGER NOT NULL REFERENCES users ("ID"),
	"CHARS" bigint NOT NULL DEFAULT 0,
	"CHARS_D" bigint NOT NULL DEFAULT 0,
	"MESSAGES" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_E" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_D" INTEGER NOT NULL DEFAULT 0,
	"IMAGES" INTEGER NOT NULL DEFAULT 0,
	"TYPINGS" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID")
);

CREATE OR REPLACE FUNCTION stats_user_registered()
RETURNS TRIGGER as $$
BEGIN
	INSERT INTO stats__generic_users ("ID") VALUES (NEW."ID") ON CONFLICT ("ID") DO NOTHING;
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stats ON users;
CREATE TRIGGER stats
	AFTER INSERT ON users FOR EACH ROW 
	EXECUTE PROCEDURE stats_user_registered();

CREATE TABLE IF NOT EXISTS stats__generic_servers (
	"ID" INTEGER NOT NULL REFERENCES servers ("ID"),
	"CHARS" bigint NOT NULL DEFAULT 0,
	"CHARS_D" bigint NOT NULL DEFAULT 0,
	"MESSAGES" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_E" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_D" INTEGER NOT NULL DEFAULT 0,
	"IMAGES" INTEGER NOT NULL DEFAULT 0,
	"TYPINGS" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID")
);

CREATE OR REPLACE FUNCTION stats_server_registered()
RETURNS TRIGGER as $$
BEGIN
	INSERT INTO stats__generic_servers ("ID") VALUES (NEW."ID") ON CONFLICT ("ID") DO NOTHING;
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stats ON servers;
CREATE TRIGGER stats
	AFTER INSERT ON servers FOR EACH ROW 
	EXECUTE PROCEDURE stats_server_registered();

CREATE TABLE IF NOT EXISTS stats__peruser_servers (
	"ID" INTEGER NOT NULL REFERENCES servers ("ID"),
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"CHARS" bigint NOT NULL DEFAULT 0,
	"CHARS_D" bigint NOT NULL DEFAULT 0,
	"MESSAGES" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_E" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_D" INTEGER NOT NULL DEFAULT 0,
	"IMAGES" INTEGER NOT NULL DEFAULT 0,
	"TYPINGS" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "USER")
);

CREATE TABLE IF NOT EXISTS stats__generic_channels (
	"ID" INTEGER NOT NULL REFERENCES channels ("ID"),
	"CHARS" bigint NOT NULL DEFAULT 0,
	"CHARS_D" bigint NOT NULL DEFAULT 0,
	"MESSAGES" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_E" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_D" INTEGER NOT NULL DEFAULT 0,
	"IMAGES" INTEGER NOT NULL DEFAULT 0,
	"TYPINGS" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID")
);

CREATE OR REPLACE FUNCTION stats_channel_registered()
RETURNS TRIGGER as $$
BEGIN
	INSERT INTO stats__generic_channels ("ID") VALUES (NEW."ID") ON CONFLICT ("ID") DO NOTHING;
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stats ON channels;
CREATE TRIGGER stats
	AFTER INSERT ON channels FOR EACH ROW 
	EXECUTE PROCEDURE stats_channel_registered();

CREATE TABLE IF NOT EXISTS stats__peruser_channels (
	"ID" INTEGER NOT NULL REFERENCES channels ("ID"),
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"CHARS" bigint NOT NULL DEFAULT 0,
	"CHARS_D" bigint NOT NULL DEFAULT 0,
	"MESSAGES" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_E" INTEGER NOT NULL DEFAULT 0,
	"MESSAGES_D" INTEGER NOT NULL DEFAULT 0,
	"IMAGES" INTEGER NOT NULL DEFAULT 0,
	"TYPINGS" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "USER")
);

CREATE TABLE IF NOT EXISTS stats__command_channels (
	"ID" INTEGER NOT NULL REFERENCES channels ("ID"),
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_users (
	"ID" INTEGER NOT NULL REFERENCES users ("ID"),
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__command_servers (
	"ID" INTEGER NOT NULL REFERENCES servers ("ID"),
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__ucommand_channels (
	"ID" INTEGER NOT NULL REFERENCES channels ("ID"),
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "USER", "COMMAND")
);

CREATE TABLE IF NOT EXISTS stats__ucommand_servers (
	"ID" INTEGER NOT NULL REFERENCES servers ("ID"),
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"COMMAND" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "USER", "COMMAND")
);

-- NUMBER is 1000 multipler
CREATE TABLE IF NOT EXISTS stats__channel_get_image (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"CHANNEL" INTEGER NOT NULL REFERENCES channels ("ID"),
	"NUMBER" INTEGER NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE IF NOT EXISTS stats__server_get_image (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"NUMBER" INTEGER NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE IF NOT EXISTS stats__channel_get (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"CHANNEL" INTEGER NOT NULL REFERENCES channels ("ID"),
	"NUMBER" INTEGER NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE IF NOT EXISTS stats__server_get (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"NUMBER" INTEGER NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE OR REPLACE FUNCTION stats_gets_server_trigger_update()
RETURNS TRIGGER as $$
DECLARE current_images INTEGER;
DECLARE current_messages INTEGER;
BEGIN
	IF (OLD."IMAGES" != NEW."IMAGES") THEN
		SELECT stats__generic_servers."IMAGES" INTO current_images FROM stats__generic_servers WHERE stats__generic_servers."ID" = NEW."ID";

		IF (current_images % 100 = 0 AND current_images > 0) THEN
			INSERT INTO
				stats__server_get_image
				("MEMBER", "NUMBER")
			VALUES
				(get_member_id_soft(NEW."USER", NEW."ID"), floor(current_images / 100));
		END IF;
	END IF;
	
	IF (OLD."MESSAGES" != NEW."MESSAGES") THEN
		SELECT stats__generic_servers."MESSAGES" INTO current_messages FROM stats__generic_servers WHERE stats__generic_servers."ID" = NEW."ID";

		IF (current_messages % 1000 = 0 AND current_messages > 0) THEN
			INSERT INTO
				stats__server_get
				("MEMBER", "NUMBER")
			VALUES
				(get_member_id_soft(NEW."USER", NEW."ID"), floor(current_messages / 1000));
		END IF;
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_gets_server_trigger_insert()
RETURNS TRIGGER as $$
DECLARE current_images INTEGER;
DECLARE current_messages INTEGER;
BEGIN
	SELECT stats__generic_servers."IMAGES" INTO current_images FROM stats__generic_servers WHERE stats__generic_servers."ID" = NEW."ID";
	SELECT stats__generic_servers."MESSAGES" INTO current_messages FROM stats__generic_servers WHERE stats__generic_servers."ID" = NEW."ID";
	
	IF (current_images % 100 = 0 AND current_images > 0) THEN
		INSERT INTO
			stats__server_get_image
			("MEMBER", "NUMBER")
		VALUES
			(get_member_id_soft(NEW."USER", NEW."ID"), floor(current_images / 100));
	END IF;

	IF (current_messages % 1000 = 0 AND current_messages > 0) THEN
		INSERT INTO
			stats__server_get
			("MEMBER", "NUMBER")
		VALUES
			(get_member_id_soft(NEW."USER", NEW."ID"), floor(current_messages / 1000));
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_gets_channel_trigger_update()
RETURNS TRIGGER as $$
DECLARE current_images INTEGER;
DECLARE current_messages INTEGER;
BEGIN
	IF (OLD."IMAGES" != NEW."IMAGES") THEN
		SELECT stats__generic_channels."IMAGES" INTO current_images FROM stats__generic_channels WHERE stats__generic_channels."ID" = NEW."ID";

		IF (current_images % 100 = 0 AND current_images > 0) THEN
			INSERT INTO
				stats__channel_get_image
				("MEMBER", "CHANNEL", "NUMBER")
			VALUES
				(get_member_id_soft(NEW."USER", get_server_from_channel(NEW."ID")), NEW."ID", floor(current_images / 100));
		END IF;
	END IF;
	
	IF (OLD."MESSAGES" != NEW."MESSAGES") THEN
		SELECT stats__generic_channels."MESSAGES" INTO current_messages FROM stats__generic_channels WHERE stats__generic_channels."ID" = NEW."ID";

		IF (current_messages % 1000 = 0 AND current_messages > 0) THEN
			INSERT INTO
				stats__channel_get
				("MEMBER", "CHANNEL", "NUMBER")
			VALUES
				(get_member_id_soft(NEW."USER", get_server_from_channel(NEW."ID")), NEW."ID", floor(current_messages / 1000));
		END IF;
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_gets_channel_trigger_insert()
RETURNS TRIGGER as $$
DECLARE current_images INTEGER;
DECLARE current_messages INTEGER;
BEGIN
	SELECT stats__generic_channels."IMAGES" INTO current_images FROM stats__generic_channels WHERE stats__generic_channels."ID" = NEW."ID";
	SELECT stats__generic_channels."MESSAGES" INTO current_messages FROM stats__generic_channels WHERE stats__generic_channels."ID" = NEW."ID";

	IF (current_images % 100 = 0 AND current_images > 0) THEN
		INSERT INTO
			stats__channel_get_image
			("MEMBER", "CHANNEL", "NUMBER")
		VALUES
			(get_member_id_soft(NEW."USER", get_server_from_channel(NEW."ID")), NEW."ID", floor(current_images / 100));
	END IF;

	IF (current_messages % 1000 = 0 AND current_messages > 0) THEN
		INSERT INTO
			stats__channel_get
			("MEMBER", "CHANNEL", "NUMBER")
		VALUES
			(get_member_id_soft(NEW."USER", get_server_from_channel(NEW."ID")), NEW."ID", floor(current_messages / 1000));
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS get_log ON stats__peruser_servers;
DROP TRIGGER IF EXISTS get_log_insert ON stats__peruser_servers;

DROP TRIGGER IF EXISTS get_log ON stats__peruser_channels;
DROP TRIGGER IF EXISTS get_log_insert ON stats__peruser_channels;

CREATE TRIGGER get_log
	BEFORE UPDATE ON stats__peruser_servers FOR EACH ROW 
	EXECUTE PROCEDURE stats_gets_server_trigger_update();

CREATE TRIGGER get_log_insert
	AFTER INSERT ON stats__peruser_servers FOR EACH ROW 
	EXECUTE PROCEDURE stats_gets_server_trigger_insert();

CREATE TRIGGER get_log
	BEFORE UPDATE ON stats__peruser_channels FOR EACH ROW 
	EXECUTE PROCEDURE stats_gets_channel_trigger_update();

CREATE TRIGGER get_log_insert
	AFTER INSERT ON stats__peruser_channels FOR EACH ROW 
	EXECUTE PROCEDURE stats_gets_channel_trigger_insert();

CREATE TABLE IF NOT EXISTS stats__words_db (
	"ID" SERIAL,
	"WORD" VARCHAR(64) NOT NULL,
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	UNIQUE ("ID"),
	PRIMARY KEY ("WORD")
);

CREATE TABLE IF NOT EXISTS stats__uwords_channels (
	"ID" INTEGER NOT NULL REFERENCES channels ("ID"),
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"WORD" INTEGER NOT NULL REFERENCES stats__words_db ("ID"),
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "WORD", "USER")
);

CREATE TABLE IF NOT EXISTS stats__uwords_servers (
	"ID" INTEGER NOT NULL REFERENCES servers ("ID"),
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"WORD" INTEGER NOT NULL REFERENCES stats__words_db ("ID"),
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "WORD", "USER")
);

CREATE TABLE IF NOT EXISTS stats__words_channels (
	"ID" INTEGER NOT NULL REFERENCES channels ("ID"),
	"WORD" INTEGER NOT NULL REFERENCES stats__words_db ("ID"),
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "WORD")
);

CREATE TABLE IF NOT EXISTS stats__words_users (
	"ID" INTEGER NOT NULL REFERENCES users ("ID"),
	"WORD" INTEGER NOT NULL REFERENCES stats__words_db ("ID"),
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "WORD")
);

CREATE TABLE IF NOT EXISTS stats__words_servers (
	"ID" INTEGER NOT NULL REFERENCES servers ("ID"),
	"WORD" INTEGER NOT NULL REFERENCES stats__words_db ("ID"),
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "WORD")
);

CREATE TABLE IF NOT EXISTS steam_emoji_fail (
	"EMOJI" VARCHAR(32) NOT NULL
);

CREATE TABLE IF NOT EXISTS steamid (
	"STEAMID64" VARCHAR(64) NOT NULL,
	"STEAMID" char(32) NOT NULL,
	"STEAMID3" char(32) NOT NULL,
	"CUSTOMID" VARCHAR(128) NOT NULL,
	PRIMARY KEY ("STEAMID64")
);

CREATE TABLE IF NOT EXISTS steamid_fail (
	"STEAMID64" VARCHAR(64) DEFAULT NULL,
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
	"STAMP" INTEGER NOT NULL DEFAULT currtime(),
	PRIMARY KEY ("ID")
);

CREATE TABLE IF NOT EXISTS uptime_bot (
	"START" INTEGER NOT NULL,
	"AMOUNT" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS urbancache (
	"WORD" VARCHAR(200) NOT NULL,
	"DEFINITION" TEXT NOT NULL,
	"TAGS" VARCHAR(512) NOT NULL,
	"ULINK" VARCHAR(64) NOT NULL,
	"DEXAMPLE" TEXT NOT NULL,
	"USTAMP" INTEGER NOT NULL,
	PRIMARY KEY ("WORD")
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

CREATE TABLE IF NOT EXISTS member_softban (
	"ID" INTEGER PRIMARY KEY,
	"STAMP" INTEGER DEFAULT currtime(),
	"ADMIN" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS member_roles (
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"ROLE" INTEGER NOT NULL REFERENCES roles ("ID"),
	PRIMARY KEY ("MEMBER", "ROLE")
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
	INSERT INTO name_logs VALUES(NEW."ID", NEW."NAME", currtime(), 0) ON CONFLICT DO NOTHING;
	
	IF (OLD."NAME" != NEW."NAME") THEN
		INSERT INTO name_logs_list ("MEMBER", "OLD", "NEW") VALUES (NEW."ID", OLD."NAME", NEW."NAME");
	END IF;
	
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION member_name_trigger2()
RETURNS TRIGGER as $$
BEGIN
	INSERT INTO name_logs VALUES(NEW."ID", NEW."NAME", currtime(), 0) ON CONFLICT DO NOTHING;
	INSERT INTO name_logs_list ("MEMBER", "OLD", "NEW") VALUES (NEW."ID", NEW."NAME", NEW."NAME");
	RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS member_name_log ON members;
DROP TRIGGER IF EXISTS member_name_log2 ON members;

CREATE TRIGGER member_name_log
	AFTER UPDATE ON members FOR EACH ROW 
	EXECUTE PROCEDURE member_name_trigger();

CREATE TRIGGER member_name_log2
	AFTER INSERT ON members FOR EACH ROW 
	EXECUTE PROCEDURE member_name_trigger2();
	
-- Roles

CREATE TABLE IF NOT EXISTS roles_log (
	"ID" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL,
	"ROLE" INTEGER NOT NULL,
	"TYPE" BOOLEAN NOT NULL,
	"STAMP" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
	"ID" SERIAL PRIMARY KEY,
	"SERVER" INTEGER NOT NULL REFERENCES servers ("ID"),
	"UID" VARCHAR(64) NOT NULL,
	"NAME" VARCHAR(200) NOT NULL DEFAULT '[ERRORROLE]',
	"PERMS" discord_permission[] NOT NULL DEFAULT ARRAY []::discord_permission[],
	"COLOR_R" rgb_color NOT NULL DEFAULT (255,255,255),
	"HOIST" BOOLEAN NOT NULL DEFAULT false,
	"POSITION" SMALLINT NOT NULL DEFAULT 0,
	"MENTION" BOOLEAN NOT NULL DEFAULT false,
	"TIME" INTEGER NOT NULL DEFAULT currtime()
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

CREATE TABLE IF NOT EXISTS kick_logs (
	"ENTRY" SERIAL NOT NULL,
	"STAMP" INTEGER NOT NULL DEFAULT currtime(),
	"TYPE" BOOLEAN NOT NULL DEFAULT false, -- false - kick, true - ban
	"MEMBER_KICKER" INTEGER NOT NULL REFERENCES members ("ID"),
	"MEMBER_VICTIM" INTEGER NOT NULL REFERENCES members ("ID"),
	"SERVER" INTEGER NOT NULL REFERENCES servers ("ID")
);

CREATE TABLE IF NOT EXISTS rp_actions (
	"ACTOR" INTEGER NOT NULL,
	"ACTION" SMALLINT NOT NULL,
	"TARGET" INTEGER NOT NULL,
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ACTOR", "ACTION", "TARGET")
);

-----------------------------------
--- Search results cache tables
-----------------------------------

CREATE TABLE IF NOT EXISTS derpibooru_pics (
	"id" INTEGER NOT NULL,
	"created_at" VARCHAR(64) NOT NULL,
	"updated_at" VARCHAR(64),
	"upvotes" INTEGER NOT NULL DEFAULT 0,
	"downvotes" INTEGER NOT NULL DEFAULT 0,
	"faves" INTEGER NOT NULL DEFAULT 0,
	"tags" VARCHAR(64)[] NOT NULL,
	"thumb_tiny" VARCHAR(255),
	"thumb_small" VARCHAR(255),
	"thumb" VARCHAR(255),
	"small" VARCHAR(255),
	"medium" VARCHAR(255),
	"large" VARCHAR(255),
	"tall" VARCHAR(255),
	"full" VARCHAR(255) NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS derpibooru_search (
	"phrase" VARCHAR(64) NOT NULL,
	"stamp" INTEGER NOT NULL DEFAULT currtime(),
	"pics" INTEGER[] NOT NULL,
	PRIMARY KEY ("phrase")
);

CREATE TABLE IF NOT EXISTS google_search (
	"phrase" VARCHAR(64) NOT NULL PRIMARY KEY,
	"stamp" INTEGER NOT NULL DEFAULT currtime(),
	"id" SERIAL NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS google_search_results (
	"id" INTEGER NOT NULL REFERENCES google_search ("id"),
	"order" VARCHAR(32) NOT NULL,
	"title" VARCHAR(255) NOT NULL,
	"snippet" VARCHAR(4095) NOT NULL,
	"link" VARCHAR(255) NOT NULL,
	PRIMARY KEY ("id", "order")
);

CREATE TABLE IF NOT EXISTS google_picture (
	"phrase" VARCHAR(64) NOT NULL PRIMARY KEY,
	"stamp" INTEGER NOT NULL DEFAULT currtime(),
	"id" SERIAL NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS google_picture_results (
	"id" INTEGER NOT NULL REFERENCES google_picture ("id"),
	"title" VARCHAR(255) NOT NULL,
	"snippet" VARCHAR(4095) NOT NULL,
	"link" VARCHAR(255) NOT NULL,
	"contextLink" VARCHAR(255) NOT NULL,
	"order" SMALLINT NOT NULL,
	PRIMARY KEY ("id", "order")
);

CREATE TABLE IF NOT EXISTS translate_cache (
	"source" VARCHAR(64) NOT NULL,
	"translation" VARCHAR(511) NOT NULL,
	PRIMARY KEY ("source")
);

CREATE TABLE IF NOT EXISTS tumblr_bcache (
	"blog" VARCHAR(64) NOT NULL PRIMARY KEY,
	"id" SERIAL NOT NULL UNIQUE,
	"stamp" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE IF NOT EXISTS tumblr_cache (
	"id" INTEGER NOT NULL REFERENCES tumblr_bcache ("id"),
	"order" INTEGER NOT NULL,
	"url" VARCHAR(255) NOT NULL,
	"surl" VARCHAR(63) NOT NULL,
	"date" VARCHAR(63) NOT NULL,
	"summary" VARCHAR(511),
	"author" VARCHAR(127) NOT NULL,
	"text" TEXT,
	"images" VARCHAR(255)[] NOT NULL,
	"tags" VARCHAR(127)[] NOT NULL,
	"image_permalink" VARCHAR(255),
	PRIMARY KEY ("id", "order")
);

-----------------------------------
--- Functions
-----------------------------------

CREATE OR REPLACE FUNCTION init_tags()
RETURNS void AS $$
BEGIN
	WITH valid AS (
		SELECT
			users."ID"
		FROM
			users
		WHERE
			users."TIME" > currtime() - 120
	),

	fake_list_insert AS (
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
			)
		ON CONFLICT ("UID", "REALM", "SPACE") DO NOTHING
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

CREATE OR REPLACE FUNCTION init_tags_channels()
RETURNS void AS $$
BEGIN
	WITH valid AS (
		SELECT
			channels."ID"
		FROM
			channels
		WHERE
			channels."TIME" > currtime() - 120
	),

	fake_list_insert AS (
		INSERT INTO
			tags_list
			SELECT
				valid."ID",
				'channel' AS "REALM",
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
					tags_init."REALM" = 'channel' AND
					tags_init."SPACE" = tags_defbans."SPACE"
			)
		ON CONFLICT ("UID", "REALM", "SPACE") DO NOTHING
	)
	
	INSERT INTO
		tags_init
		SELECT
			valid."ID",
			'channel' AS "REALM",
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
				tags_init."REALM" = 'channel' AND
				tags_init."SPACE" = tags_defbans."SPACE"
		) GROUP BY
			valid."ID",
			tags_defbans."SPACE"
	ON CONFLICT DO NOTHING;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION init_tags_servers()
RETURNS void AS $$
BEGIN
	WITH valid AS (
		SELECT
			servers."ID"
		FROM
			servers
		WHERE
			servers."TIME" > currtime() - 120
	),

	fake_list_insert AS (
		INSERT INTO
			tags_list
			SELECT
				valid."ID",
				'server' AS "REALM",
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
					tags_init."REALM" = 'server' AND
					tags_init."SPACE" = tags_defbans."SPACE"
			)
		ON CONFLICT ("UID", "REALM", "SPACE") DO NOTHING
	)
	
	INSERT INTO
		tags_init
		SELECT
			valid."ID",
			'server' AS "REALM",
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
				tags_init."REALM" = 'server' AND
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
	curr_time := currtime();
	
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
	curr_time := currtime();
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

DROP TRIGGER IF EXISTS roles_logging ON roles;

CREATE TRIGGER roles_logging
	AFTER UPDATE ON roles FOR EACH ROW 
	EXECUTE PROCEDURE roles_logger_trigger();

DROP TRIGGER IF EXISTS roles_logging ON roles;

CREATE TRIGGER roles_logging
	AFTER UPDATE ON roles FOR EACH ROW 
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
	UPDATE users SET "TIME" = cTime WHERE "ID" = ANY (user_ids);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_hit(user_id_raw VARCHAR(64), message_length INTEGER, words VARCHAR(64)[], images_seneded INTEGER)
RETURNS void AS $$
DECLARE user_id INTEGER;
DECLARE word VARCHAR(64);
BEGIN
	user_id := get_user_id(user_id_raw);
	UPDATE stats__generic_users SET "MESSAGES" = "MESSAGES" + 1, "CHARS" = "CHARS" + message_length, "IMAGES" = "IMAGES" + images_seneded WHERE "ID" = user_id;
	
	WITH valid_words AS (
		SELECT
			UNNEST(words) AS "WORD",
			SUM(1) AS "WORD_COUNT"
		GROUP BY
			"WORD"
	),
	
	words_ids AS (
		INSERT INTO
			stats__words_db ("WORD", "COUNT")
			(SELECT * FROM valid_words)
		ON CONFLICT ("WORD") DO
			UPDATE SET "COUNT" = stats__words_db."COUNT" + excluded."COUNT"
		RETURNING "ID", "WORD"
	),
	
	words_to_insert AS (
		SELECT
			words_ids."ID", valid_words."WORD_COUNT"
		FROM
			valid_words, words_ids
		WHERE
			words_ids."WORD" = valid_words."WORD"
	)
	
	INSERT INTO
		stats__words_users ("ID", "WORD", "COUNT")
		(SELECT user_id, words_to_insert."ID", words_to_insert."WORD_COUNT" AS "COUNT" FROM words_to_insert)
	ON CONFLICT ("ID", "WORD") DO
		UPDATE SET "COUNT" = stats__words_users."COUNT" + excluded."COUNT";
	
	IF (images_seneded > 0) THEN
		UPDATE stats__generic_users SET "IMAGES" = "IMAGES" + images_seneded WHERE "ID" = user_id;
	END IF;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_edit(user_id_raw VARCHAR(64))
RETURNS void AS $$
BEGIN
	UPDATE stats__generic_users SET "MESSAGES_E" = "MESSAGES_E" + 1 WHERE "ID" = get_user_id(user_id_raw);
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
	
	UPDATE stats__generic_users SET "MESSAGES_E" = "MESSAGES_E" + 1 WHERE "ID" = user_id;
	UPDATE stats__generic_channels SET "MESSAGES_E" = "MESSAGES_E" + 1 WHERE "ID" = channel_id;
	UPDATE stats__generic_servers SET "MESSAGES_E" = "MESSAGES_E" + 1 WHERE "ID" = server_id;
	
	INSERT INTO stats__peruser_channels ("ID", "USER", "MESSAGES_E") VALUES (channel_id, user_id, 1)
		ON CONFLICT ("ID", "USER") DO UPDATE SET "MESSAGES_E" = stats__peruser_channels."MESSAGES_E" + 1;
	INSERT INTO stats__peruser_servers ("ID", "USER", "MESSAGES_E") VALUES (server_id, user_id, 1)
		ON CONFLICT ("ID", "USER") DO UPDATE SET "MESSAGES_E" = stats__peruser_servers."MESSAGES_E" + 1;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_hit(user_id_raw VARCHAR(64), channel_id_raw VARCHAR(64), server_id_raw VARCHAR(64), message_length INTEGER, words VARCHAR(64)[], images_seneded INTEGER)
RETURNS void AS $$
DECLARE user_id INTEGER;
DECLARE server_id INTEGER;
DECLARE channel_id INTEGER;

DECLARE words_parse_words VARCHAR(64)[];
DECLARE words_parse_counts INTEGER[];
DECLARE word_i INTEGER;
DECLARE word VARCHAR(64);
DECLARE word_check VARCHAR(64);
BEGIN
	user_id := get_user_id(user_id_raw);
	server_id := get_server_id(server_id_raw);
	channel_id := get_channel_id(channel_id_raw, server_id);
	
	UPDATE stats__generic_users SET "MESSAGES" = "MESSAGES" + 1, "CHARS" = "CHARS" + message_length, "IMAGES" = "IMAGES" + images_seneded WHERE "ID" = user_id;
	UPDATE stats__generic_channels SET "MESSAGES" = "MESSAGES" + 1, "CHARS" = "CHARS" + message_length, "IMAGES" = "IMAGES" + images_seneded WHERE "ID" = channel_id;
	UPDATE stats__generic_servers SET "MESSAGES" = "MESSAGES" + 1, "CHARS" = "CHARS" + message_length, "IMAGES" = "IMAGES" + images_seneded WHERE "ID" = server_id;
	
	INSERT INTO stats__peruser_channels("ID", "USER", "CHARS", "MESSAGES", "IMAGES")
		VALUES (channel_id, user_id, message_length, 1, images_seneded)
		ON CONFLICT ("ID", "USER") DO UPDATE SET
			"CHARS" = stats__peruser_channels."CHARS" + excluded."CHARS",
			"MESSAGES" = stats__peruser_channels."MESSAGES" + excluded."MESSAGES",
			"IMAGES" = stats__peruser_channels."IMAGES" + excluded."IMAGES";
	
	INSERT INTO stats__peruser_servers("ID", "USER", "CHARS", "MESSAGES", "IMAGES")
		VALUES (server_id, user_id, message_length, 1, images_seneded)
		ON CONFLICT ("ID", "USER") DO UPDATE SET
			"CHARS" = stats__peruser_servers."CHARS" + excluded."CHARS",
			"MESSAGES" = stats__peruser_servers."MESSAGES" + excluded."MESSAGES",
			"IMAGES" = stats__peruser_servers."IMAGES" + excluded."IMAGES";
	
	WITH valid_words AS (
		SELECT
			UNNEST(words) AS "WORD",
			SUM(1) AS "WORD_COUNT"
		GROUP BY
			"WORD"
	),
	
	words_ids AS (
		INSERT INTO
			stats__words_db ("WORD", "COUNT")
			(SELECT * FROM valid_words)
		ON CONFLICT ("WORD") DO
			UPDATE SET "COUNT" = stats__words_db."COUNT" + excluded."COUNT"
		RETURNING "ID", "WORD"
	),
	
	words_to_insert AS (
		SELECT
			words_ids."ID", valid_words."WORD_COUNT"
		FROM
			valid_words, words_ids
		WHERE
			words_ids."WORD" = valid_words."WORD"
	),
	
	fake_words_channel AS (
		INSERT INTO
			stats__words_channels ("ID", "WORD", "COUNT")
			(SELECT channel_id, words_to_insert."ID", words_to_insert."WORD_COUNT" AS "COUNT" FROM words_to_insert)
		ON CONFLICT ("ID", "WORD") DO
			UPDATE SET "COUNT" = stats__words_channels."COUNT" + excluded."COUNT"
	),
	
	fake_words_server AS (
		INSERT INTO
			stats__words_servers ("ID", "WORD", "COUNT")
			(SELECT server_id, words_to_insert."ID", words_to_insert."WORD_COUNT" AS "COUNT" FROM words_to_insert)
		ON CONFLICT ("ID", "WORD") DO
			UPDATE SET "COUNT" = stats__words_servers."COUNT" + excluded."COUNT"
	),
	
	fake_uwords_channel AS (
		INSERT INTO
			stats__uwords_channels ("ID", "USER", "WORD", "COUNT")
			(SELECT channel_id, user_id, words_to_insert."ID", words_to_insert."WORD_COUNT" AS "COUNT" FROM words_to_insert)
		ON CONFLICT ("ID", "USER", "WORD") DO
			UPDATE SET "COUNT" = stats__uwords_channels."COUNT" + excluded."COUNT"
	),
	
	fake_uwords_server AS (
		INSERT INTO
			stats__uwords_servers ("ID", "USER", "WORD", "COUNT")
			(SELECT server_id, user_id, words_to_insert."ID", words_to_insert."WORD_COUNT" AS "COUNT" FROM words_to_insert)
		ON CONFLICT ("ID", "USER", "WORD") DO
			UPDATE SET "COUNT" = stats__uwords_servers."COUNT" + excluded."COUNT"
	)
	
	INSERT INTO
		stats__words_users ("ID", "WORD", "COUNT")
		(SELECT user_id, words_to_insert."ID", words_to_insert."WORD_COUNT" AS "COUNT" FROM words_to_insert)
	ON CONFLICT ("ID", "WORD") DO
		UPDATE SET "COUNT" = stats__words_users."COUNT" + excluded."COUNT";
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_typing(user_id_raw VARCHAR(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	UPDATE stats__generic_users SET "TYPINGS" = "TYPINGS" + 1 WHERE "ID" = user_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_typing(user_id_raw VARCHAR(64), server_id_raw VARCHAR(64), channel_id_raw VARCHAR(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
DECLARE server_id INTEGER;
DECLARE channel_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	server_id := get_server_id(server_id_raw);
	channel_id := get_channel_id(channel_id_raw, server_id);
	UPDATE stats__generic_users SET "TYPINGS" = "TYPINGS" + 1 WHERE "ID" = user_id;
	UPDATE stats__generic_servers SET "TYPINGS" = "TYPINGS" + 1 WHERE "ID" = server_id;
	UPDATE stats__generic_channels SET "TYPINGS" = "TYPINGS" + 1 WHERE "ID" = channel_id;
	
	INSERT INTO stats__peruser_servers ("ID", "USER", "TYPINGS")
		VALUES (server_id, user_id, 1)
		ON CONFLICT ("ID", "USER") DO UPDATE SET
			"TYPINGS" = stats__peruser_servers."TYPINGS" + 1;
	
	INSERT INTO stats__peruser_channels ("ID", "USER", "TYPINGS")
		VALUES (channel_id, user_id, 1)
		ON CONFLICT ("ID", "USER") DO UPDATE SET
			"TYPINGS" = stats__peruser_channels."TYPINGS" + 1;
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
	
	UPDATE stats__generic_users SET "MESSAGES_D" = "MESSAGES_D" + 1, "CHARS_D" = "CHARS_D" + message_length WHERE "ID" = user_id;
	UPDATE stats__generic_channels SET "MESSAGES" = "MESSAGES_D" + 1, "CHARS_D" = "CHARS_D" + message_length WHERE "ID" = channel_id;
	UPDATE stats__generic_servers SET "MESSAGES_D" = "MESSAGES_D" + 1, "CHARS_D" = "CHARS_D" + message_length WHERE "ID" = server_id;
	
	INSERT INTO stats__peruser_channels ("ID", "USER", "CHARS_D", "MESSAGES_D")
		VALUES (channel_id, user_id, message_length, 1)
		ON CONFLICT ("ID", "USER") DO UPDATE SET
			"CHARS_D" = stats__peruser_channels."CHARS_D" + excluded."CHARS_D",
			"MESSAGES_D" = stats__peruser_channels."MESSAGES" + excluded."MESSAGES_D";
	
	INSERT INTO stats__peruser_servers ("ID", "USER", "CHARS_D", "MESSAGES_D")
		VALUES (server_id, user_id, message_length, 1)
		ON CONFLICT ("ID", "USER") DO UPDATE SET
			"CHARS_D" = stats__peruser_servers."CHARS_D" + excluded."CHARS_D",
			"MESSAGES_D" = stats__peruser_servers."MESSAGES_D" + excluded."MESSAGES_D";
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
	
	INSERT INTO stats__command_users ("ID", "COMMAND", "COUNT") VALUES (user_id, command, 1)
		ON CONFLICT ("ID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_users."COUNT" + 1;
	
	INSERT INTO stats__command_servers ("ID", "COMMAND", "COUNT") VALUES (server_id, command, 1)
		ON CONFLICT ("ID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_servers."COUNT" + 1;
	
	INSERT INTO stats__command_channels ("ID", "COMMAND", "COUNT") VALUES (channel_id, command, 1)
		ON CONFLICT ("ID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_channels."COUNT" + 1;
	
	INSERT INTO stats__ucommand_servers ("ID", "USER", "COMMAND", "COUNT") VALUES (server_id, user_id, command, 1)
		ON CONFLICT ("ID", "USER", "COMMAND") DO UPDATE SET "COUNT" = stats__ucommand_servers."COUNT" + 1;
	
	INSERT INTO stats__ucommand_channels ("ID", "USER", "COMMAND", "COUNT") VALUES (channel_id, user_id, command, 1)
		ON CONFLICT ("ID", "USER", "COMMAND") DO UPDATE SET "COUNT" = stats__ucommand_channels."COUNT" + 1;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_command(user_id_raw VARCHAR(64), command VARCHAR(64))
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	INSERT INTO stats__command_users ("ID", "COMMAND", "COUNT") VALUES (get_user_id(user_id_raw), command, 1)
		ON CONFLICT ("ID", "COMMAND") DO UPDATE SET "COUNT" = stats__command_users."COUNT" + 1;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_delete(user_id_raw VARCHAR(64), message_length INTEGER)
RETURNS void AS $$
DECLARE user_id INTEGER;
BEGIN
	user_id := get_user_id(user_id_raw);
	UPDATE stats__generic_users SET "MESSAGES_D" = "MESSAGES_D" + 1, "CHARS_D" = "CHARS_D" + message_length WHERE "ID" = user_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION users_heartbeat()
RETURNS void AS $$
DECLARE cTime INTEGER;
BEGIN
	cTime := currtime();
	UPDATE uptime SET "LASTONLINE" = cTime, "TOTAL_ONLINE" = "TOTAL_ONLINE" + 5 FROM users WHERE users."ID" = uptime."ID" AND users."STATUS" != 'offline' AND users."TIME" > cTime - 120;
	UPDATE uptime SET "ONLINE" = "ONLINE" + 5 FROM users WHERE users."ID" = uptime."ID" AND users."STATUS" = 'online' AND users."TIME" > cTime - 120;
	UPDATE uptime SET "AWAY" = "AWAY" + 5 FROM users WHERE users."ID" = uptime."ID" AND users."STATUS" = 'idle' AND users."TIME" > cTime - 120;
	UPDATE uptime SET "DNT" = "DNT" + 5 FROM users WHERE users."ID" = uptime."ID" AND users."STATUS" = 'dnd' AND users."TIME" > cTime - 120;
	UPDATE uptime SET "TOTAL_OFFLINE" = "TOTAL_OFFLINE" + 5 FROM users WHERE users."ID" = uptime."ID" AND users."STATUS" = 'offline' AND users."TIME" > cTime - 120;
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
		members,
		users
	WHERE
		members."USER" = users."ID" AND
		users."TIME" > cTime - 120 AND
		name_logs."MEMBER" = members."ID" AND
		name_logs."NAME" = members."NAME";
	
	UPDATE
		uname_logs
	SET
		"LASTUSE" = cTime,
		"TIME" = uname_logs."TIME" + 10
	FROM
		users
	WHERE
		users."TIME" > cTime - 120 AND
		uname_logs."USER" = users."ID" AND
		uname_logs."NAME" = users."NAME";
		
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_role_id_combined(fUID VARCHAR(64), fSERVER2 VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
DECLARE fSERVER INTEGER;
BEGIN
	fSERVER := get_server_id(fSERVER2);
	
	SELECT "roles"."ID" INTO last_id FROM "roles" WHERE "roles"."UID" = fUID AND "roles"."SERVER" = fSERVER;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "roles" ("SERVER", "UID") VALUES (fSERVER, fUID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_role_id(fUID VARCHAR(64), fSERVER INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "roles"."ID" INTO last_id FROM "roles" WHERE "roles"."UID" = fUID AND "roles"."SERVER" = fSERVER;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "roles" ("SERVER", "UID") VALUES (fSERVER, fUID) RETURNING "ID" INTO last_id;
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
	SELECT "channels"."ID" INTO last_id FROM "channels" WHERE "channels"."UID" = fUID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "channels" ("UID", "SID") VALUES (fUID, sID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_server_from_channel(sID INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "channels"."SID" INTO last_id FROM "channels" WHERE "channels"."ID" = sID;
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_server_id(sID VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "servers"."ID" INTO last_id FROM "servers" WHERE "servers"."UID" = sID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "servers" ("UID") VALUES (sID) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_servers_id(sID VARCHAR(64)[])
RETURNS TABLE ("SERID" INTEGER, "UID" VARCHAR(64)) AS $$
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
				servers
			WHERE
				missing."MISSING" = servers."UID"
		)
	)
	
	INSERT INTO "servers" ("UID") SELECT * FROM missing_tab WHERE missing_tab."MISSING" IS NOT NULL;
	UPDATE "servers" SET "TIME" = currtime() WHERE servers."UID" = ANY (sID);
	
	RETURN QUERY SELECT servers."ID", servers."UID" FROM servers WHERE servers."UID" = ANY (sID);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_users_id(sID VARCHAR(64)[])
RETURNS TABLE ("ID" INTEGER, "UID" VARCHAR(64)) AS $$
BEGIN
	WITH temp_arr AS (SELECT UNNEST(sID) AS "MISS")
	INSERT INTO "users" ("UID") (SELECT temp_arr."MISS" AS "UID" FROM temp_arr WHERE temp_arr."MISS" NOT IN (SELECT users."UID" FROM users));
	UPDATE "users" SET "TIME" = currtime() WHERE users."UID" = ANY (sID);
	
	RETURN QUERY SELECT users."ID", users."UID" FROM users WHERE users."UID" = ANY (sID);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_channels_id(sID VARCHAR(64)[], sID2 INTEGER[])
RETURNS TABLE ("CHANID" INTEGER, "UID" VARCHAR(64)) AS $$
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
				channels
			WHERE
				missing."MISSING_CHANNEL" = channels."UID" AND
				missing."MISSING_SERVER" = channels."SID"
		)
	)
	
	INSERT INTO "channels" ("UID", "SID") SELECT * FROM missing_tab WHERE missing_tab."MISSING_CHANNEL" IS NOT NULL;
	UPDATE channels SET "TIME" = currtime() WHERE channels."UID" = ANY (sID);
	
	RETURN QUERY SELECT channels."ID", channels."UID" FROM channels WHERE channels."UID" = ANY (sID);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_roles_id(serverid INTEGER, rolesids VARCHAR(64)[])
RETURNS TABLE ("ID" INTEGER, "UID" VARCHAR(64), "SERVER" INTEGER) AS $$
BEGIN
	WITH missing_tab AS (
		WITH missing AS (
			SELECT
				UNNEST(rolesids) AS "MISSING_ROLE",
				serverid AS "MISSING_SERVER"
		)
		
		SELECT
			missing."MISSING_ROLE",
			missing."MISSING_SERVER"
		FROM
			missing
		WHERE NOT EXISTS (
			SELECT
				missing."MISSING_ROLE",
				missing."MISSING_SERVER"
			FROM
				roles
			WHERE
				missing."MISSING_ROLE" = roles."UID" AND
				missing."MISSING_SERVER" = roles."SERVER"
		)
	)
	
	INSERT INTO "roles" ("UID", "SERVER") SELECT * FROM missing_tab WHERE missing_tab."MISSING_ROLE" IS NOT NULL;
	
	RETURN QUERY SELECT roles."ID", roles."UID", roles."SERVER" FROM roles WHERE roles."UID" = ANY (rolesids);
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
				members
			WHERE
				missing."MISSING_USER" = members."USER" AND
				missing."MISSING_SERVER" = members."SERVER"
		)
	)
	
	INSERT INTO "members" ("USER", "SERVER") SELECT * FROM missing_tab WHERE missing_tab."MISSING_USER" IS NOT NULL AND missing_tab."MISSING_SERVER" IS NOT NULL;
	
	RETURN QUERY SELECT members."ID", members."USER", members."SERVER" FROM members WHERE members."USER" = ANY (sID) AND members."SERVER" = ANY (sID2);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_user_id(sID VARCHAR(64))
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "users"."ID" INTO last_id FROM "users" WHERE "users"."UID" = sID;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "users" ("UID") VALUES (sID) RETURNING "ID" INTO last_id;
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
	
	SELECT "members"."ID" INTO last_id FROM "members" WHERE "members"."USER" = usr_internal_id AND "members"."SERVER" = ser_internal_id;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "members" ("USER", "SERVER") VALUES (usr_internal_id, ser_internal_id) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_member_id_soft(usr_internal_id INTEGER, ser_internal_id INTEGER)
RETURNS INTEGER AS $$
DECLARE last_id INTEGER;
BEGIN
	SELECT "members"."ID" INTO last_id FROM "members" WHERE "members"."USER" = usr_internal_id AND "members"."SERVER" = ser_internal_id;
	
	IF (last_id IS NULL) THEN
		INSERT INTO "members" ("USER", "SERVER") VALUES (usr_internal_id, ser_internal_id) RETURNING "ID" INTO last_id;
	END IF;
	
	RETURN last_id;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_member_id(memberid INTEGER)
RETURNS INTEGER AS $$
DECLARE to_return INTEGER;
BEGIN
	SELECT "members"."USER" INTO to_return FROM "members" WHERE "members"."ID" = memberid;
	RETURN to_return;
END $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_member(memberid INTEGER)
RETURNS VARCHAR(64) as $$
DECLARE iuid INTEGER;
BEGIN
	RETURN (SELECT "users"."UID" FROM "users", "members" WHERE "members"."ID" = memberid AND "users"."ID" = "members"."USER");
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_get_rank(userid INTEGER)
RETURNS INTEGER as $$
DECLARE urank INTEGER;
DECLARE psaid INTEGER;
BEGIN
	SELECT "MESSAGES" INTO psaid FROM stats__generic_users WHERE "ID" = userid;
	
	SELECT
		COUNT(*) INTO urank
	FROM
		stats__generic_users
	WHERE
		stats__generic_users."MESSAGES" > psaid;
	
	urank = urank + 1;
	RETURN urank;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_get_rank(userid INTEGER, serverid INTEGER)
RETURNS INTEGER as $$
DECLARE urank INTEGER;
DECLARE psaid INTEGER;
BEGIN
	SELECT "MESSAGES" INTO psaid FROM stats__peruser_servers WHERE "USER" = userid AND "ID" = serverid;
	
	SELECT
		COUNT(*) INTO urank
	FROM
		stats__peruser_servers
	WHERE
		stats__peruser_servers."MESSAGES" > psaid AND
		"ID" = serverid;
	
	urank = urank + 1;
	RETURN urank;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_get_rank_channel(userid INTEGER, channel INTEGER)
RETURNS INTEGER as $$
DECLARE urank INTEGER;
DECLARE psaid INTEGER;
BEGIN
	SELECT "MESSAGES" INTO psaid FROM stats__peruser_channels WHERE "USER" = userid AND "ID" = channel;
	
	SELECT
		COUNT(*) INTO urank
	FROM
		stats__peruser_channels
	WHERE
		stats__peruser_channels."MESSAGES" > psaid AND
		"ID" = channel;
	
	urank = urank + 1;
	RETURN urank;
END; $$ LANGUAGE plpgsql;
