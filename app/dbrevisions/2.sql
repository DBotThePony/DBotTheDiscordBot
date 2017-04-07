
-- 
-- Copyright (C) 2016-2017 DBot. All other content, that was used, but not created in this project, is licensed under their own licenses, and belong to their authors.
-- 
-- Licensed under the Apache License, Version 2.0 (the "License");
-- you may not use this file except in compliance with the License.
-- You may obtain a copy of the License at
-- 
--      http://www.apache.org/licenses/LICENSE-2.0
--  
-- Unless required by applicable law or agreed to in writing, software
-- distributed under the License is distributed on an "AS IS" BASIS,
-- WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
-- See the License for the specific language governing permissions and
-- limitations under the License.
-- 

-- Stats redo
-- This should work, but i just deleted the old stats database because of massive problems with it

INSERT INTO stats__generic_users (
	SELECT
		stats__chars_client."UID",
		stats__chars_client."COUNT",
		stats__chars_client_d."COUNT",
		stats__phrases_client."COUNT",
		stats__phrases_client_e."COUNT",
		stats__phrases_client_d."COUNT",
		stats__images_client."COUNT"
	FROM
		stats__chars_client,
		stats__chars_client_d,
		stats__phrases_client,
		stats__images_client,
		stats__phrases_client_e,
		stats__phrases_client_d
	WHERE
		stats__chars_client_d."UID" = stats__chars_client."UID" AND
		stats__phrases_client."UID" = stats__chars_client."UID" AND
		stats__images_client."UID" = stats__chars_client."UID" AND
		stats__phrases_client_e."UID" = stats__chars_client."UID" AND
		stats__phrases_client_d."UID" = stats__chars_client."UID" AND
		stats__chars_client."UID" IN (
			SELECT "ID" FROM users
		)
);

INSERT INTO stats__generic_users ("ID") (SELECT users."ID" FROM users WHERE users."ID" NOT IN (SELECT stats__generic_users."ID" FROM stats__generic_users));

DROP TABLE stats__chars_client;
DROP TABLE stats__chars_client_d;
DROP TABLE stats__phrases_client;
DROP TABLE stats__phrases_client_e;
DROP TABLE stats__phrases_client_d;
DROP TABLE stats__images_client;

INSERT INTO stats__generic_channels (
	SELECT
		stats__chars_channel."UID",
		stats__chars_channel."COUNT",
		stats__chars_channel_d."COUNT",
		stats__phrases_channel."COUNT",
		stats__phrases_channel_e."COUNT",
		stats__phrases_channel_d."COUNT",
		stats__images_channel."COUNT"
	FROM
		stats__chars_channel,
		stats__chars_channel_d,
		stats__phrases_channel,
		stats__images_channel,
		stats__phrases_channel_e,
		stats__phrases_channel_d
	WHERE
		stats__chars_channel_d."UID" = stats__chars_channel."UID" AND
		stats__phrases_channel."UID" = stats__chars_channel."UID" AND
		stats__images_channel."UID" = stats__chars_channel."UID" AND
		stats__phrases_channel_e."UID" = stats__chars_channel."UID" AND
		stats__phrases_channel_d."UID" = stats__chars_channel."UID" AND
		stats__chars_channel."UID" IN (
			SELECT "ID" FROM channels
		)
);

INSERT INTO stats__generic_channels ("ID") (SELECT channels."ID" FROM channels WHERE channels."ID" NOT IN (SELECT stats__generic_channels."ID" FROM stats__generic_channels));

DROP TABLE stats__chars_channel;
DROP TABLE stats__chars_channel_d;
DROP TABLE stats__phrases_channel;
DROP TABLE stats__images_channel;
DROP TABLE stats__phrases_channel_e;
DROP TABLE stats__phrases_channel_d;

INSERT INTO stats__generic_servers (
	SELECT
		stats__chars_server."UID",
		stats__chars_server."COUNT",
		stats__chars_server_d."COUNT",
		stats__phrases_server."COUNT",
		stats__phrases_server_e."COUNT",
		stats__phrases_server_d."COUNT",
		stats__images_server."COUNT"
	FROM
		stats__chars_server,
		stats__chars_server_d,
		stats__phrases_server,
		stats__images_server,
		stats__phrases_server_e,
		stats__phrases_server_d
	WHERE
		stats__chars_server_d."UID" = stats__chars_server."UID" AND
		stats__phrases_server."UID" = stats__chars_server."UID" AND
		stats__images_server."UID" = stats__chars_server."UID" AND
		stats__phrases_server_e."UID" = stats__chars_server."UID" AND
		stats__phrases_server_d."UID" = stats__chars_server."UID" AND
		stats__chars_server."UID" IN (
			SELECT "ID" FROM servers
		)
);

INSERT INTO stats__generic_servers ("ID") (SELECT servers."ID" FROM servers WHERE servers."ID" NOT IN (SELECT stats__generic_servers."ID" FROM stats__generic_servers));

DROP TABLE stats__chars_server;
DROP TABLE stats__chars_server_d;
DROP TABLE stats__phrases_server;
DROP TABLE stats__images_server;
DROP TABLE stats__phrases_server_e;
DROP TABLE stats__phrases_server_d;

ALTER TABLE stats__command_uchannel RENAME TO stats__ucommand_channel_old;
ALTER TABLE stats__command_userver RENAME TO stats__ucommand_server_old;
ALTER TABLE stats__command_channel RENAME TO stats__command_channel_old;
ALTER TABLE stats__command_client RENAME TO stats__command_client_old;
ALTER TABLE stats__command_server RENAME TO stats__command_server_old;

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

INSERT INTO stats__command_channels (
	SELECT stats__command_channel_old."UID", stats__command_channel_old."COMMAND", stats__command_channel_old."COUNT"
	FROM stats__command_channel_old
	WHERE stats__command_channel_old."UID" IN (SELECT "ID" FROM channels)
);

INSERT INTO stats__command_servers (
	SELECT stats__command_server_old."UID", stats__command_server_old."COMMAND", stats__command_server_old."COUNT"
	FROM stats__command_server_old
	WHERE stats__command_server_old."UID" IN (SELECT "ID" FROM servers)
);

INSERT INTO stats__command_users (
	SELECT stats__command_client_old."UID", stats__command_client_old."COMMAND", stats__command_client_old."COUNT"
	FROM stats__command_client_old
	WHERE stats__command_client_old."UID" IN (SELECT "ID" FROM users)
);

DROP TABLE stats__command_channel_old;
DROP TABLE stats__command_client_old;
DROP TABLE stats__command_server_old;

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

INSERT INTO stats__ucommand_channels (
	SELECT stats__ucommand_channel_old."CHANNEL", stats__ucommand_channel_old."UID", stats__ucommand_channel_old."COMMAND", stats__ucommand_channel_old."COUNT"
	FROM stats__ucommand_channel_old
	WHERE stats__ucommand_channel_old."CHANNEL" IN (SELECT "ID" FROM channels)
);

INSERT INTO stats__ucommand_servers (
	SELECT stats__ucommand_server_old."USERVER", stats__ucommand_server_old."UID", stats__ucommand_server_old."COMMAND", stats__ucommand_server_old."COUNT"
	FROM stats__ucommand_server_old
	WHERE stats__ucommand_server_old."USERVER" IN (SELECT "ID" FROM servers)
);

INSERT INTO stats__peruser_servers (
	SELECT
		stats__uchars_server."USERVER",
		stats__uchars_server."UID",
		stats__uchars_server."COUNT",
		stats__uchars_server_d."COUNT",
		stats__uphrases_server."COUNT",
		stats__uphrases_server_e."COUNT",
		stats__uphrases_server_d."COUNT",
		stats__uimages_server."COUNT"
	FROM
		stats__uchars_server,
		stats__uphrases_server,
		stats__uphrases_server_e,
		stats__uphrases_server_d,
		stats__uchars_server_d,
		stats__uimages_server
	WHERE
		stats__uphrases_server."UID" = stats__uchars_server."UID" AND
		stats__uphrases_server."USERVER" = stats__uchars_server."USERVER" AND
		stats__uphrases_server_e."UID" = stats__uchars_server."UID" AND
		stats__uphrases_server_e."USERVER" = stats__uchars_server."USERVER" AND
		stats__uphrases_server_d."UID" = stats__uchars_server."UID" AND
		stats__uphrases_server_d."USERVER" = stats__uchars_server."USERVER" AND
		stats__uimages_server."UID" = stats__uchars_server."UID" AND
		stats__uimages_server."USERVER" = stats__uchars_server."USERVER" AND
		stats__uchars_server_d."UID" = stats__uchars_server."UID" AND
		stats__uchars_server_d."USERVER" = stats__uchars_server."USERVER" AND
		stats__uchars_server."USERVER" IN (SELECT "ID" FROM servers) AND
		stats__uchars_server."UID" IN (SELECT "ID" FROM users)
);

DROP TABLE stats__uchars_server;
DROP TABLE stats__uphrases_server;
DROP TABLE stats__uphrases_server_e;
DROP TABLE stats__uphrases_server_d;
DROP TABLE stats__uimages_server;

INSERT INTO stats__peruser_channels (
	SELECT
		stats__uchars_channel."CHANNEL",
		stats__uchars_channel."UID",
		stats__uchars_channel."COUNT",
		stats__uchars_channel_d."COUNT",
		stats__uphrases_channel."COUNT",
		stats__uphrases_channel_e."COUNT",
		stats__uphrases_channel_d."COUNT",
		stats__uimages_channel."COUNT"
	FROM
		stats__uchars_channel,
		stats__uphrases_channel,
		stats__uphrases_channel_e,
		stats__uphrases_channel_d,
		stats__uchars_channel_d,
		stats__uimages_channel
	WHERE
		stats__uphrases_channel."UID" = stats__uchars_channel."UID" AND
		stats__uphrases_channel."CHANNEL" = stats__uchars_channel."CHANNEL" AND
		stats__uphrases_channel_e."UID" = stats__uchars_channel."UID" AND
		stats__uphrases_channel_e."CHANNEL" = stats__uchars_channel."CHANNEL" AND
		stats__uphrases_channel_d."UID" = stats__uchars_channel."UID" AND
		stats__uphrases_channel_d."CHANNEL" = stats__uchars_channel."CHANNEL" AND
		stats__uchars_channel_d."UID" = stats__uchars_channel."UID" AND
		stats__uchars_channel_d."CHANNEL" = stats__uchars_channel."CHANNEL" AND
		stats__uimages_channel."UID" = stats__uchars_channel."UID" AND
		stats__uimages_channel."CHANNEL" = stats__uchars_channel."CHANNEL" AND
		stats__uchars_channel."CHANNEL" IN (SELECT "ID" FROM channels) AND
		stats__uchars_channel."UID" IN (SELECT "ID" FROM users)
);

DROP TABLE stats__uchars_channel;
DROP TABLE stats__uphrases_channel;
DROP TABLE stats__uphrases_channel_e;
DROP TABLE stats__uphrases_channel_d;
DROP TABLE stats__uimages_channel;

ALTER TABLE stats__channel_get_image RENAME TO stats__channel_get_image_old;
ALTER TABLE stats__server_get_image RENAME TO stats__server_get_image_old;
ALTER TABLE stats__channel_get RENAME TO stats__channel_get_old;
ALTER TABLE stats__server_get RENAME TO stats__server_get_old;

DROP SEQUENCE IF EXISTS "stats__channel_get_image_ENTRY_seq" CASCADE;
DROP SEQUENCE IF EXISTS "stats__server_get_image_ENTRY_seq" CASCADE;
DROP SEQUENCE IF EXISTS "stats__channel_get_ENTRY_seq" CASCADE;
DROP SEQUENCE IF EXISTS "stats__server_get_ENTRY_seq" CASCADE;

CREATE TABLE stats__channel_get_image (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"CHANNEL" INTEGER NOT NULL REFERENCES channels ("ID"),
	"NUMBER" INTEGER NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE stats__server_get_image (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"NUMBER" INTEGER NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE stats__channel_get (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"CHANNEL" INTEGER NOT NULL REFERENCES channels ("ID"),
	"NUMBER" INTEGER NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

CREATE TABLE stats__server_get (
	"ENTRY" SERIAL PRIMARY KEY,
	"MEMBER" INTEGER NOT NULL REFERENCES members ("ID"),
	"NUMBER" INTEGER NOT NULL DEFAULT 0,
	"STAMP" INTEGER NOT NULL DEFAULT currtime()
);

INSERT INTO stats__channel_get_image (SELECT * FROM stats__channel_get_image_old WHERE stats__channel_get_image_old."MEMBER" IN (SELECT "ID" FROM members) AND stats__channel_get_image_old."CHANNEL" IN (SELECT "ID" FROM channels));
INSERT INTO stats__server_get_image (SELECT * FROM stats__server_get_image_old WHERE stats__server_get_image_old."MEMBER" IN (SELECT "ID" FROM members));
INSERT INTO stats__channel_get (SELECT * FROM stats__channel_get_old WHERE stats__channel_get_old."MEMBER" IN (SELECT "ID" FROM members) AND stats__channel_get_old."CHANNEL" IN (SELECT "ID" FROM channels));
INSERT INTO stats__server_get (SELECT * FROM stats__server_get_old WHERE stats__server_get_old."MEMBER" IN (SELECT "ID" FROM members));

DROP TABLE stats__channel_get_image_old;
DROP TABLE stats__server_get_image_old;
DROP TABLE stats__channel_get_old;
DROP TABLE stats__server_get_old;

DO $$
DECLARE max_getimage_c INTEGER;
DECLARE max_get_c INTEGER;
DECLARE max_getimage_s INTEGER;
DECLARE max_get_s INTEGER;
BEGIN
	SELECT MAX("ENTRY") + 1 INTO max_getimage_c FROM stats__channel_get_image;
	SELECT MAX("ENTRY") + 1 INTO max_get_c FROM stats__channel_get;
	SELECT MAX("ENTRY") + 1 INTO max_getimage_s FROM stats__server_get_image;
	SELECT MAX("ENTRY") + 1 INTO max_get_s FROM stats__server_get;
	
	PERFORM setval('"stats__channel_get_image_ENTRY_seq"', max_getimage_c, true);
	PERFORM setval('"stats__channel_get_ENTRY_seq"', max_get_c, true);
	PERFORM setval('"stats__server_get_image_ENTRY_seq"', max_getimage_s, true);
	PERFORM setval('"stats__server_get_ENTRY_seq"', max_get_s, true);
END
$$;

ALTER TABLE stats__uwords_channel RENAME TO stats__uwords_channel_old;
ALTER TABLE stats__uwords_server RENAME TO stats__uwords_server_old;
ALTER TABLE stats__words_channel RENAME TO stats__words_channel_old;
ALTER TABLE stats__words_server RENAME TO stats__words_server_old;
ALTER TABLE stats__words_client RENAME TO stats__words_client_old;

CREATE TABLE IF NOT EXISTS stats__uwords_channels (
	"ID" INTEGER NOT NULL REFERENCES channels ("ID"),
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"WORD" INTEGER NOT NULL REFERENCES stats__words_db ("ID"),
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "WORD", "CHANNEL")
);

CREATE TABLE IF NOT EXISTS stats__uwords_servers (
	"ID" INTEGER NOT NULL REFERENCES servers ("ID"),
	"USER" INTEGER NOT NULL REFERENCES users ("ID"),
	"WORD" INTEGER NOT NULL REFERENCES stats__words_db ("ID"),
	"COUNT" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("ID", "WORD", "USERVER")
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

INSERT INTO stats__uwords_channels (
	SELECT stats__uwords_channel_old."CHANNEL", stats__uwords_channel_old."UID", stats__uwords_channel_old."WORD", stats__uwords_channel_old."COUNT"
	FROM stats__uwords_channel_old
	WHERE stats__uwords_channel_old."CHANNEL" IN (SELECT "ID" FROM channels) AND stats__uwords_channel_old."UID" IN (SELECT "ID" FROM users) AND stats__uwords_channel_old."WORD" IN (SELECT "ID" FROM stats__words_db)
);

INSERT INTO stats__uwords_servers (
	SELECT stats__uwords_server_old."USERVER", stats__uwords_server_old."UID", stats__uwords_server_old."WORD", stats__uwords_server_old."COUNT"
	FROM stats__uwords_server_old
	WHERE stats__uwords_server_old."USERVER" IN (SELECT "ID" FROM servers) AND stats__uwords_server_old."UID" IN (SELECT "ID" FROM users) AND stats__uwords_server_old."WORD" IN (SELECT "ID" FROM stats__words_db)
);

INSERT INTO stats__words_servers (
	SELECT stats__words_server_old."UID", stats__words_server_old."WORD", stats__words_server_old."COUNT"
	FROM stats__words_server_old
	WHERE stats__words_server_old."UID" IN (SELECT "ID" FROM servers) AND stats__words_server_old."WORD" IN (SELECT "ID" FROM stats__words_db)
);

INSERT INTO stats__words_channels (
	SELECT stats__words_channel_old."UID", stats__words_channel_old."WORD", stats__words_channel_old."COUNT"
	FROM stats__words_channel_old
	WHERE stats__words_channel_old."UID" IN (SELECT "ID" FROM channels) AND stats__words_channel_old."WORD" IN (SELECT "ID" FROM stats__words_db)
);

INSERT INTO stats__words_users (
	SELECT stats__words_client_old."UID", stats__words_client_old."WORD", stats__words_client_old."COUNT"
	FROM stats__words_client_old
	WHERE stats__words_client_old."UID" IN (SELECT "ID" FROM users) AND stats__words_client_old."WORD" IN (SELECT "ID" FROM stats__words_db)
);

DROP TABLE stats__uwords_channel_old;
DROP TABLE stats__uwords_server_old;
DROP TABLE stats__words_channel_old;
DROP TABLE stats__words_server_old;
DROP TABLE stats__words_client_old;
DROP TABLE stats__words;
