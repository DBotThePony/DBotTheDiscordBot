
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
