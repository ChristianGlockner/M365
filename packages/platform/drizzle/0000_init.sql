CREATE TYPE "public"."membership_role" AS ENUM('owner', 'admin', 'analyst', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."tenant_consent_status" AS ENUM('pending', 'granted', 'revoked', 'error');--> statement-breakpoint
CREATE TYPE "public"."assessment_run_status" AS ENUM('queued', 'running', 'succeeded', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."finding_status" AS ENUM('passed', 'failed', 'investigate', 'skipped', 'error', 'not_run');--> statement-breakpoint
CREATE TYPE "public"."finding_severity" AS ENUM('critical', 'high', 'medium', 'low', 'info');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('de', 'en');--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"default_locale" "locale" DEFAULT 'de' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);--> statement-breakpoint
CREATE TABLE "org_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"primary_color" text DEFAULT '#0f4c81' NOT NULL,
	"accent_color" text DEFAULT '#1a7a4c' NOT NULL,
	"surface_color" text DEFAULT '#f5f7fa' NOT NULL,
	"logo_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "org_branding_organization_id_unique" UNIQUE("organization_id")
);--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entra_oid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"preferred_locale" "locale",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "membership_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "tenant_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"entra_tenant_id" text NOT NULL,
	"display_name" text NOT NULL,
	"consent_status" "tenant_consent_status" DEFAULT 'pending' NOT NULL,
	"consented_at" timestamp with time zone,
	"disconnected_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "assessment_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"tenant_link_id" uuid NOT NULL,
	"module_id" text NOT NULL,
	"status" "assessment_run_status" DEFAULT 'queued' NOT NULL,
	"locale" "locale" DEFAULT 'de' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"tenant_link_id" uuid NOT NULL,
	"assessment_run_id" uuid NOT NULL,
	"module_id" text NOT NULL,
	"collector_id" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "findings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"tenant_link_id" uuid NOT NULL,
	"assessment_run_id" uuid NOT NULL,
	"module_id" text NOT NULL,
	"check_id" text NOT NULL,
	"status" "finding_status" NOT NULL,
	"severity" "finding_severity" DEFAULT 'info' NOT NULL,
	"title_key" text NOT NULL,
	"remediation_key" text,
	"evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"framework_refs" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "org_branding" ADD CONSTRAINT "org_branding_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_links" ADD CONSTRAINT "tenant_links_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_runs" ADD CONSTRAINT "assessment_runs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_runs" ADD CONSTRAINT "assessment_runs_tenant_link_id_tenant_links_id_fk" FOREIGN KEY ("tenant_link_id") REFERENCES "public"."tenant_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_tenant_link_id_tenant_links_id_fk" FOREIGN KEY ("tenant_link_id") REFERENCES "public"."tenant_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_assessment_run_id_assessment_runs_id_fk" FOREIGN KEY ("assessment_run_id") REFERENCES "public"."assessment_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_tenant_link_id_tenant_links_id_fk" FOREIGN KEY ("tenant_link_id") REFERENCES "public"."tenant_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "findings" ADD CONSTRAINT "findings_assessment_run_id_assessment_runs_id_fk" FOREIGN KEY ("assessment_run_id") REFERENCES "public"."assessment_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_entra_oid_uidx" ON "users" USING btree ("entra_oid");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_org_user_uidx" ON "memberships" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_links_org_entra_uidx" ON "tenant_links" USING btree ("organization_id","entra_tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_links_org_idx" ON "tenant_links" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "assessment_runs_org_tenant_idx" ON "assessment_runs" USING btree ("organization_id","tenant_link_id");--> statement-breakpoint
CREATE INDEX "assessment_runs_module_idx" ON "assessment_runs" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "snapshots_run_idx" ON "snapshots" USING btree ("assessment_run_id");--> statement-breakpoint
CREATE INDEX "snapshots_org_tenant_idx" ON "snapshots" USING btree ("organization_id","tenant_link_id");--> statement-breakpoint
CREATE INDEX "findings_run_idx" ON "findings" USING btree ("assessment_run_id");--> statement-breakpoint
CREATE INDEX "findings_org_tenant_idx" ON "findings" USING btree ("organization_id","tenant_link_id");--> statement-breakpoint
CREATE INDEX "findings_check_idx" ON "findings" USING btree ("check_id");
