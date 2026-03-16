CREATE TYPE "public"."transport" AS ENUM('walk', 'train', 'bus', 'plane', 'car', 'ship', 'bicycle', 'taxi', 'cablecar');--> statement-breakpoint
CREATE TABLE "overviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"shiori_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"title" varchar(255),
	"content" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"shiori_id" uuid NOT NULL,
	"sort_order" integer NOT NULL,
	"date" date,
	"day_number" integer,
	"time" time,
	"title" varchar(255),
	"transport" "transport",
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shioris" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"passphrase" varchar(255),
	"is_premium" boolean DEFAULT false NOT NULL,
	"last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "overviews" ADD CONSTRAINT "overviews_shiori_id_shioris_id_fk" FOREIGN KEY ("shiori_id") REFERENCES "public"."shioris"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_shiori_id_shioris_id_fk" FOREIGN KEY ("shiori_id") REFERENCES "public"."shioris"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "overviews_shiori_id_idx" ON "overviews" USING btree ("shiori_id");--> statement-breakpoint
CREATE INDEX "schedules_shiori_id_idx" ON "schedules" USING btree ("shiori_id");--> statement-breakpoint
CREATE INDEX "shioris_last_accessed_at_idx" ON "shioris" USING btree ("last_accessed_at");