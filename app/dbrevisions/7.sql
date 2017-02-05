
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
