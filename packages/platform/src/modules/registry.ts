import {
  createModuleRegistry,
  getModuleNav,
  listModules,
  type ModuleRegistry,
  type PlatformModule,
} from "@m365/module-sdk";
import { caModule } from "@m365/module-ca";

let registry: ModuleRegistry | null = null;

/** Boot-time module registry. Feature flags can filter later. */
export function getModuleRegistry(): ModuleRegistry {
  if (!registry) {
    registry = createModuleRegistry([caModule]);
  }
  return registry;
}

export function getRegisteredModules(): PlatformModule[] {
  return listModules(getModuleRegistry());
}

export function getRegisteredModuleNav() {
  return getModuleNav(getModuleRegistry());
}

export function getModuleById(id: string): PlatformModule | undefined {
  return getModuleRegistry().get(id);
}

export { caModule };
