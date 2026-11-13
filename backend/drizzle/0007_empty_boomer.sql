CREATE TABLE "weekly_goals" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"target_type" varchar(16) NOT NULL,
	"target_value" real NOT NULL,
	"reminder_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "weekly_goals" ADD CONSTRAINT "weekly_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;