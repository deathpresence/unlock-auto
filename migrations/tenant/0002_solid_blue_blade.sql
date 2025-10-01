CREATE TABLE IF NOT EXISTS "branch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp NOT NULL,
	"name" text NOT NULL,
	"city" text,
	"address" text,
	"phone" varchar(64),
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'branch'
  ) THEN
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "branch" TO app_user';
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY';
  END IF;
END $$;--> statement-breakpoint
DROP TABLE IF EXISTS "projects" CASCADE;--> statement-breakpoint
ALTER TABLE "document" DROP CONSTRAINT IF EXISTS "document_id_created_at_pk";