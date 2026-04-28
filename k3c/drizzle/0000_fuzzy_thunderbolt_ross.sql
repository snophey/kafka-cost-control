CREATE TABLE IF NOT EXISTS "metrics" (
	"technical_name" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT ''
);
