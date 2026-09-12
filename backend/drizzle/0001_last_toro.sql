CREATE TABLE "job_holiday_bonus" (
	"id" text PRIMARY KEY NOT NULL,
	"job_profile_id" text NOT NULL,
	"bonus_percentage" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "job_holiday_bonus_job_profile_id_unique" UNIQUE("job_profile_id")
);
--> statement-breakpoint
CREATE TABLE "job_pay_rate" (
	"id" text PRIMARY KEY NOT NULL,
	"job_profile_id" text NOT NULL,
	"start_minute" integer NOT NULL,
	"end_minute" integer NOT NULL,
	"hourly_rate_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'HUF' NOT NULL,
	"time_zone" text DEFAULT 'Europe/Budapest' NOT NULL,
	"country_code" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "national_holiday" (
	"id" text PRIMARY KEY NOT NULL,
	"country_code" text NOT NULL,
	"name" text NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"recurs_annually" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_shift" (
	"id" text PRIMARY KEY NOT NULL,
	"job_profile_id" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"ended_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "job_holiday_bonus" ADD CONSTRAINT "job_holiday_bonus_job_profile_id_job_profile_id_fk" FOREIGN KEY ("job_profile_id") REFERENCES "public"."job_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_pay_rate" ADD CONSTRAINT "job_pay_rate_job_profile_id_job_profile_id_fk" FOREIGN KEY ("job_profile_id") REFERENCES "public"."job_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_profile" ADD CONSTRAINT "job_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_shift" ADD CONSTRAINT "work_shift_job_profile_id_job_profile_id_fk" FOREIGN KEY ("job_profile_id") REFERENCES "public"."job_profile"("id") ON DELETE cascade ON UPDATE no action;