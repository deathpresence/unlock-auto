CREATE TABLE "chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp NOT NULL,
	"title" text NOT NULL,
	"user_id" uuid NOT NULL,
	"visibility" varchar DEFAULT 'private' NOT NULL,
	"last_context" jsonb
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"kind" varchar DEFAULT 'text' NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "document_id_created_at_pk" PRIMARY KEY("id","created_at")
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"role" varchar NOT NULL,
	"parts" json NOT NULL,
	"attachments" json NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stream" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggestion" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"document_id" uuid NOT NULL,
	"document_created_at" timestamp NOT NULL,
	"original_text" text NOT NULL,
	"suggested_text" text NOT NULL,
	"description" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vote" (
	"chat_id" uuid NOT NULL,
	"message_id" uuid NOT NULL,
	"is_upvoted" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote" ADD CONSTRAINT "vote_message_id_message_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."message"("id") ON DELETE no action ON UPDATE no action;