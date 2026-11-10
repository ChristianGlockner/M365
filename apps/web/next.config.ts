import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "path";
import createNextIntlPlugin from "next-intl/plugin";

// Load monorepo-root .env as well as apps/web/.env (Try Live / turbo cwd).
loadEnvConfig(path.join(__dirname, "../.."));
loadEnvConfig(__dirname);

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@m365/platform",
    "@m365/module-sdk",
    "@m365/module-ca",
  ],
  output: "standalone",
};

export default withNextIntl(nextConfig);
