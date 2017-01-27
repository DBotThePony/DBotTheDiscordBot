
-- First database revision. Hohoho!
-- Actually i wanted to test it, but i started to do refactoring of database
-- So this file does refactoring from old database to new

INSERT INTO users (
	SELECT
		user_id."ID",
		user_id."UID",
		user_names."USERNAME",
		last_seen."TIME",
		user_status."STATUS"
	FROM
		user_id,
		user_names,
		last_seen,
		user_status
	WHERE
		user_names."ID" = user_id."ID" AND
		last_seen."ID" = user_id."ID" AND
		user_status."ID" = user_id."ID"
) ON CONFLICT ("ID") DO NOTHING;

DROP TABLE user_id;
DROP TABLE user_names;
DROP TABLE last_seen;
DROP TABLE user_status;

INSERT INTO servers (
	SELECT
		server_id."ID",
		server_id."UID",
		server_names."NAME",
		last_seen_servers."TIME"
	FROM
		server_id,
		server_names,
		last_seen_servers
	WHERE
		last_seen_servers."ID" = server_id."ID" AND
		server_names."ID" = server_id."ID"
) ON CONFLICT ("ID") DO NOTHING;

DROP TABLE server_id;
DROP TABLE server_names;
DROP TABLE last_seen_servers;

DELETE FROM channel_id WHERE channel_id."SID" NOT IN (SELECT "ID" FROM servers);

INSERT INTO channels (
	SELECT
		channel_id."ID",
		channel_id."UID",
		channel_id."SID",
		channel_names."NAME",
		last_seen_channels."TIME"
	FROM
		channel_id,
		channel_names,
		last_seen_channels
	WHERE
		last_seen_channels."ID" = channel_id."ID" AND
		channel_names."ID" = channel_id."ID"
) ON CONFLICT ("ID") DO NOTHING;

DROP TABLE channel_id;
DROP TABLE channel_names;
DROP TABLE last_seen_channels;

DELETE FROM member_id WHERE member_id."SERVER" NOT IN (SELECT "ID" FROM servers) OR member_id."USER" NOT IN (SELECT "ID" FROM users);

INSERT INTO members (
	SELECT
		member_id."ID",
		member_id."USER",
		member_id."SERVER",
		member_names."NAME",
		0
	FROM
		member_id,
		member_names
	WHERE
		member_names."ID" = member_id."ID"
) ON CONFLICT ("ID") DO NOTHING;

DROP TABLE member_id;
DROP TABLE member_names;

DELETE FROM roles_id WHERE roles_id."SERVER" NOT IN (SELECT "ID" FROM servers);

INSERT INTO roles (
	SELECT
		roles_id."ID",
		roles_id."SERVER",
		roles_id."UID",
		roles_names."NAME",
		roles_perms."PERMS",
		roles_options."COLOR_R",
		roles_options."HOIST",
		roles_options."POSITION",
		roles_options."MENTION"
	FROM
		roles_id,
		roles_names,
		roles_perms,
		roles_options
	WHERE
		roles_perms."ID" = roles_id."ID" AND
		roles_names."ROLEID" = roles_id."ID" AND
		roles_options."ID" = roles_id."ID"
) ON CONFLICT ("ID") DO NOTHING;

DROP TABLE roles_id;
DROP TABLE roles_names;
DROP TABLE roles_perms;
DROP TABLE roles_options;

DO $$
DECLARE max_value_users INTEGER;
DECLARE max_value_servers INTEGER;
DECLARE max_value_channels INTEGER;
DECLARE max_value_roles INTEGER;
DECLARE max_value_members INTEGER;
BEGIN
	
	SELECT MAX("ID") + 1 INTO max_value_users FROM users;
	SELECT MAX("ID") + 1 INTO max_value_servers FROM servers;
	SELECT MAX("ID") + 1 INTO max_value_channels FROM channels;
	SELECT MAX("ID") + 1 INTO max_value_roles FROM roles;
	SELECT MAX("ID") + 1 INTO max_value_members FROM members;
	
	PERFORM setval('public."users_ID_seq"', max_value_users, true);
	PERFORM setval('public."servers_ID_seq"', max_value_servers, true);
	PERFORM setval('public."channels_ID_seq"', max_value_channels, true);
	PERFORM setval('public."roles_ID_seq"', max_value_roles, true);
	PERFORM setval('public."members_ID_seq"', max_value_members, true);
END
$$;
