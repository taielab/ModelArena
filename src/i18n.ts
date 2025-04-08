import { getRequestConfig } from "next-intl/server";
import { defineRouting } from "next-intl/routing";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export default getRequestConfig(async ({ locale: _locale }) => {
  // 使用推荐的 requestLocale() 方法
  const locale = _locale;
  
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Europe/Vienna",
    locale: locale // 显式返回locale以避免警告
  };
});

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "zh"],

  // Used when no locale matches
  defaultLocale: "zh",
});
// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation(routing);
