import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

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
