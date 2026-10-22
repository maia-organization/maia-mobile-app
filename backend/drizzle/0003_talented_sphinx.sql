CREATE TABLE "planned_workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"planned_date" date NOT NULL,
	"type" varchar(32) NOT NULL,
	"title" varchar(128) NOT NULL,
	"duration" integer NOT NULL,
	"intensity" varchar(32) NOT NULL,
	"phase" varchar(32) NOT NULL,
	"adaptation" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "planned_workouts" ADD CONSTRAINT "planned_workouts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "planned_workouts_user_date_unique" ON "planned_workouts" USING btree ("user_id","planned_date");