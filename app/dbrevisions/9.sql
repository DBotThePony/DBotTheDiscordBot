
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

DROP TABLE IF EXISTS google_search_results;
DROP TABLE IF EXISTS google_picture_results;
DROP TABLE IF EXISTS google_search;
DROP TABLE IF EXISTS google_picture;

CREATE TABLE IF NOT EXISTS google_search (
	"phrase" VARCHAR(64) NOT NULL PRIMARY KEY,
	"stamp" INTEGER NOT NULL DEFAULT currtime(),
	"id" SERIAL NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS google_picture (
	"phrase" VARCHAR(64) NOT NULL PRIMARY KEY,
	"stamp" INTEGER NOT NULL DEFAULT currtime(),
	"id" SERIAL NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS google_search_results (
	"id" INTEGER NOT NULL REFERENCES google_search ("id"),
	"order" SMALLINT NOT NULL,
	"title" VARCHAR(512) NOT NULL,
	"snippet" VARCHAR(4095) NOT NULL,
	"link" VARCHAR(512) NOT NULL,
	PRIMARY KEY ("id", "order")
);

CREATE TABLE IF NOT EXISTS google_picture_results (
	"id" INTEGER NOT NULL REFERENCES google_picture ("id"),
	"title" VARCHAR(512) NOT NULL,
	"snippet" VARCHAR(4095) NOT NULL,
	"link" VARCHAR(512) NOT NULL,
	"contextLink" VARCHAR(512) NOT NULL,
	"order" SMALLINT NOT NULL,
	PRIMARY KEY ("id", "order")
);
