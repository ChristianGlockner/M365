import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Core tenancy + assessment placeholders.
 * Isolation rule: every tenant-scoped row carries organizationId (+ tenantLinkId where applicable).
 */

export const membershipRoleEnum = pgEnum("membership_role", [
  "owner",
  "admin",
  "analyst",
  "viewer",
]);

export const tenantConsentStatusEnum = pgEnum("tenant_consent_status", [
  "pending",
  "granted",
  "revoked",
  "error",
]);

export const assessmentRunStatusEnum = pgEnum("assessment_run_status", [
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
]);

export const findingStatusEnum = pgEnum("finding_status", [
  "passed",
  "failed",
  "investigate",
  "skipped",
  "error",
  "not_run",
]);

export const findingSeverityEnum = pgEnum("finding_severity", [
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);

export const localeEnum = pgEnum("locale", ["de", "en"]);

/** Customer / partner boundary (SSO + billing later). */
export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  defaultLocale: localeEnum("default_locale").notNull().default("de"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Org branding → CSS variables + logo at runtime. */
export const orgBranding = pgTable("org_branding", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  primaryColor: text("primary_color").notNull().default("#0f4c81"),
  accentColor: text("accent_color").notNull().default("#1a7a4c"),
  surfaceColor: text("surface_color").notNull().default("#f5f7fa"),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Users authenticated via Entra (or future IdP). */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entraOid: text("entra_oid").notNull(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    preferredLocale: localeEnum("preferred_locale"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("users_entra_oid_uidx").on(t.entraOid),
    index("users_email_idx").on(t.email),
  ],
);

/** User ↔ Org membership with role. */
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: membershipRoleEnum("role").notNull().default("viewer"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("memberships_org_user_uidx").on(t.organizationId, t.userId),
    index("memberships_user_idx").on(t.userId),
  ],
);

/** Connected Entra customer tenant (Mandant). */
export const tenantLinks = pgTable(
  "tenant_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    entraTenantId: text("entra_tenant_id").notNull(),
    displayName: text("display_name").notNull(),
    consentStatus: tenantConsentStatusEnum("consent_status")
      .notNull()
      .default("pending"),
    /** Last successful admin consent timestamp */
    consentedAt: timestamp("consented_at", { withTimezone: true }),
    disconnectedAt: timestamp("disconnected_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("tenant_links_org_entra_uidx").on(
      t.organizationId,
      t.entraTenantId,
    ),
    index("tenant_links_org_idx").on(t.organizationId),
  ],
);

/** Assessment run placeholder — bound to one TenantLink. */
export const assessmentRuns = pgTable(
  "assessment_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tenantLinkId: uuid("tenant_link_id")
      .notNull()
      .references(() => tenantLinks.id, { onDelete: "cascade" }),
    moduleId: text("module_id").notNull(),
    status: assessmentRunStatusEnum("status").notNull().default("queued"),
    locale: localeEnum("locale").notNull().default("de"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("assessment_runs_org_tenant_idx").on(
      t.organizationId,
      t.tenantLinkId,
    ),
    index("assessment_runs_module_idx").on(t.moduleId),
  ],
);

/** Normalized Graph snapshot for a run (reproducibility / re-collect). */
export const snapshots = pgTable(
  "snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tenantLinkId: uuid("tenant_link_id")
      .notNull()
      .references(() => tenantLinks.id, { onDelete: "cascade" }),
    assessmentRunId: uuid("assessment_run_id")
      .notNull()
      .references(() => assessmentRuns.id, { onDelete: "cascade" }),
    moduleId: text("module_id").notNull(),
    collectorId: text("collector_id").notNull(),
    payload: jsonb("payload").notNull().default({}),
    collectedAt: timestamp("collected_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("snapshots_run_idx").on(t.assessmentRunId),
    index("snapshots_org_tenant_idx").on(t.organizationId, t.tenantLinkId),
  ],
);

/** Finding placeholder — Maester-inspired status model. */
export const findings = pgTable(
  "findings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tenantLinkId: uuid("tenant_link_id")
      .notNull()
      .references(() => tenantLinks.id, { onDelete: "cascade" }),
    assessmentRunId: uuid("assessment_run_id")
      .notNull()
      .references(() => assessmentRuns.id, { onDelete: "cascade" }),
    moduleId: text("module_id").notNull(),
    checkId: text("check_id").notNull(),
    status: findingStatusEnum("status").notNull(),
    severity: findingSeverityEnum("severity").notNull().default("info"),
    titleKey: text("title_key").notNull(),
    remediationKey: text("remediation_key"),
    evidence: jsonb("evidence").notNull().default({}),
    frameworkRefs: jsonb("framework_refs").$type<
      { framework: string; control: string }[]
    >(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("findings_run_idx").on(t.assessmentRunId),
    index("findings_org_tenant_idx").on(t.organizationId, t.tenantLinkId),
    index("findings_check_idx").on(t.checkId),
  ],
);

export type Organization = typeof organizations.$inferSelect;
export type User = typeof users.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type TenantLink = typeof tenantLinks.$inferSelect;
export type OrgBranding = typeof orgBranding.$inferSelect;
export type AssessmentRun = typeof assessmentRuns.$inferSelect;
export type Snapshot = typeof snapshots.$inferSelect;
export type FindingRow = typeof findings.$inferSelect;
