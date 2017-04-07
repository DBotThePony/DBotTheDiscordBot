
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

DROP TABLE font_sizes_14;
ALTER TABLE font_sizes RENAME TO font_sizes_14;
ALTER TABLE font_height RENAME TO font_height_old;

CREATE TABLE font_height (
	"ID" INTEGER NOT NULL REFERENCES font_ids ("ID"),
	"HEIGHT" SMALLINT NOT NULL,
	"SIZE" SMALLINT NOT NULL DEFAULT 14,
	PRIMARY KEY ("ID", "SIZE")
);

INSERT INTO font_height (
	SELECT "ID", "HEIGHT", 14 AS "SIZE" FROM font_height_old
);

-- ALTER TABLE font_height
-- 	ADD COLUMN "SIZE" SMALLINT NOT NULL,
-- 	ADD CONSTRAINT font_sizes_id_fkey FOREIGN KEY ("ID") REFERENCES font_ids ("ID") MATCH FULL,
-- 	DROP CONSTRAINT font_height_pkey,
-- 	ADD CONSTRAINT font_height_pkey PRIMARY KEY ("ID", "SIZE");

-- DROP SEQUENCE "font_height_ID_seq" CASCADE;

DROP TABLE font_height_old;
