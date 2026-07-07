import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "./config";

// Cookie-based locale resolution (no locale-prefixed routing), so existing
// routes — including `[username]` profiles and `api/*` — are left untouched.
// On the first visit (no cookie yet) we negotiate from Accept-Language.
export default getRequestConfig(async () => {
  const store = await cookies();
  const requested = store.get(LOCALE_COOKIE)?.value;

  let locale = isLocale(requested) ? requested : undefined;
  if (!locale) {
    const preferred = (await headers())
      .get("accept-language")
      ?.split(",")[0]
      ?.split("-")[0]
      ?.trim();
    locale = isLocale(preferred) ? preferred : defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
