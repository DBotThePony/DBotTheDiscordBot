
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

ALTER TABLE stats__generic_users
	ADD COLUMN "TYPINGS" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE stats__generic_servers
	ADD COLUMN "TYPINGS" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE stats__peruser_servers
	ADD COLUMN "TYPINGS" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE stats__generic_channels
	ADD COLUMN "TYPINGS" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE stats__peruser_channels
	ADD COLUMN "TYPINGS" INTEGER NOT NULL DEFAULT 0;
