import type { PlatformModule } from "@m365/module-sdk";

/**
 * Conditional Access module stub.
 * Collectors/analyzers land in the next PR (inventory + assessment).
 */
export const caModule: PlatformModule = {
  id: "ca",
  version: "0.1.0",
  displayNameKey: "module.ca.name",
  requiredGraphScopes: {
    read: [
      "openid",
      "profile",
      "offline_access",
      "User.Read",
      "Policy.Read.ConditionalAccess",
      "Policy.Read.All",
      "Directory.Read.All",
      // Granular alternatives (prefer when tightening consent):
      // "User.Read.All",
      // "Group.Read.All",
      // "Application.Read.All",
      // "RoleManagement.Read.Directory",
    ],
    // Reserved for future deploy / remediation — do NOT request in assessment-first MVP.
    write: [
      // "Policy.ReadWrite.ConditionalAccess",
    ],
  },
  routes: [
    {
      path: "",
      titleKey: "module.ca.routes.overview",
    },
  ],
  nav: [
    {
      href: "",
      labelKey: "module.ca.nav.overview",
      icon: "shield",
    },
  ],
  collectors: [],
  analyzers: [],
  exportContributions: [
    {
      id: "ca-summary",
      titleKey: "module.ca.export.summary",
    },
  ],
  baselineKinds: ["cis-m365-foundations", "ca-persona-baseline"],
};

export default caModule;
