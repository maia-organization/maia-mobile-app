CREATE TABLE "privacy_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"profile_visibility" varchar(16) DEFAULT 'public' NOT NULL,
	"default_run_visibility" varchar(16) DEFAULT 'followers' NOT NULL,
	"show_cycle" boolean DEFAULT false NOT NULL,
	"show_stats" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "privacy_settings" ADD CONSTRAINT "privacy_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;