
--
-- Copyright (C) 2017 DBot.
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

CREATE TABLE IF NOT EXISTS "roleplay" (
	"actor" BIGINT NOT NULL,
	"target" BIGINT NOT NULL,
	"action" SMALLINT NOT NULL,
	"times" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("actor", "target", "action")
);

CREATE TABLE IF NOT EXISTS "roleplay_generic" (
	"actor" BIGINT NOT NULL,
	"action" SMALLINT NOT NULL,
	"times" INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY ("actor", "action")
);

CREATE TABLE IF NOT EXISTS "server_colors" (
	"server" BIGINT NOT NULL,
	"colors" BIGINT[] NOT NULL,
	PRIMARY KEY ("server")
);

CREATE TABLE IF NOT EXISTS "shipping" (
	"first" BIGINT NOT NULL,
	"second" BIGINT NOT NULL,
	"times" INTEGER NOT NULL DEFAULT 1,
	PRIMARY KEY ("first", "second")
);
