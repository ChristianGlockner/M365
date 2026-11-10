/**
 * Module plugin contract for the M365 Reporting Platform.
 * Every module (CA, Entra, EXO, …) implements PlatformModule.
 */

export type FindingStatus =
  | "passed"
  | "failed"
  | "investigate"
  | "skipped"
  | "error"
  | "not_run";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface FrameworkRef {
  framework: string;
  control: string;
}

export interface Finding {
  /** Stable check id, e.g. "CA.MFA.001" */
  id: string;
  moduleId: string;
  status: FindingStatus;
  severity: FindingSeverity;
  titleKey: string;
  evidence: unknown;
  remediationKey?: string;
  frameworkRefs?: FrameworkRef[];
}

export interface ModuleRoute {
  /** Path segment under /t/[tenant]/m/[module]/… */
  path: string;
  /** i18n key for page title */
  titleKey: string;
}

export interface ModuleNavItem {
  href: string;
  labelKey: string;
  icon?: string;
}

export interface CollectorContext {
  organizationId: string;
  tenantLinkId: string;
  /** Opaque Graph access token / client — wired in later PRs */
  graph?: unknown;
}

export interface Collector {
  id: string;
  descriptionKey: string;
  collect: (ctx: CollectorContext) => Promise<unknown>;
}

export interface AnalyzerContext {
  organizationId: string;
  tenantLinkId: string;
  snapshot: unknown;
}

export interface Analyzer {
  id: string;
  descriptionKey: string;
  analyze: (ctx: AnalyzerContext) => Promise<Finding[]>;
}

export interface ExportSection {
  id: string;
  titleKey: string;
}

/**
 * Graph scopes the module needs.
 * `write` scopes are reserved for future deploy/remediation — not requested in assessment-first MVP.
 */
export interface ModuleGraphScopes {
  read: string[];
  /** Reserved for future write/deploy flows; do not request in assessment-first UI. */
  write?: string[];
}

export interface PlatformModule {
  id: string;
  version: string;
  displayNameKey: string;
  requiredGraphScopes: ModuleGraphScopes;
  routes: ModuleRoute[];
  nav: ModuleNavItem[];
  collectors: Collector[];
  analyzers: Analyzer[];
  exportContributions?: ExportSection[];
  baselineKinds?: string[];
}

export type ModuleRegistry = Map<string, PlatformModule>;

export function createModuleRegistry(
  modules: PlatformModule[] = [],
): ModuleRegistry {
  const registry: ModuleRegistry = new Map();
  for (const mod of modules) {
    if (registry.has(mod.id)) {
      throw new Error(`Duplicate module id: ${mod.id}`);
    }
    registry.set(mod.id, mod);
  }
  return registry;
}

export function registerModule(
  registry: ModuleRegistry,
  mod: PlatformModule,
): ModuleRegistry {
  if (registry.has(mod.id)) {
    throw new Error(`Module already registered: ${mod.id}`);
  }
  registry.set(mod.id, mod);
  return registry;
}

export function listModules(registry: ModuleRegistry): PlatformModule[] {
  return Array.from(registry.values());
}

export function getModuleNav(registry: ModuleRegistry): ModuleNavItem[] {
  return listModules(registry).flatMap((m) =>
    m.nav.map((item) => ({
      ...item,
      href: item.href.startsWith("/") ? item.href : `/m/${m.id}/${item.href}`,
    })),
  );
}
