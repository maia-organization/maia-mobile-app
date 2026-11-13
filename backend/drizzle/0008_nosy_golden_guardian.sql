CREATE TABLE "push_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(512) NOT NULL,
	"platform" varchar(16) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_devices_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "push_devices" ADD CONSTRAINT "push_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;