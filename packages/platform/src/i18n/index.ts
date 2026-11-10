export const SUPPORTED_LOCALES = ["de", "en"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "de";

export function isAppLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Resolve locale: user preference → org default → browser → de.
 */
export function resolveLocale(input: {
  userPreferred?: string | null;
  orgDefault?: string | null;
  browser?: string | null;
}): AppLocale {
  for (const candidate of [
    input.userPreferred,
    input.orgDefault,
    input.browser,
  ]) {
    if (candidate && isAppLocale(candidate)) return candidate;
  }
  return DEFAULT_LOCALE;
}
