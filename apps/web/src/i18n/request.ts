import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { isAppLocale, DEFAULT_LOCALE } from "@m365/platform";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && isAppLocale(requested) ? requested : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
