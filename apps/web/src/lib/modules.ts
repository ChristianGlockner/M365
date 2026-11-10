/**
 * Module plugin registration hook for the web shell.
 * Routes/nav are derived from the platform registry (module-ca registered at boot).
 */
export {
  getModuleById,
  getModuleRegistry,
  getRegisteredModuleNav,
  getRegisteredModules,
} from "@m365/platform";
