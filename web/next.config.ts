import type { NextConfig } from "next";
import nextPwa from "next-pwa";

const withPWA = nextPwa({
    dest: "public",
    register: true,
});

const baseConfig: NextConfig = {
    devIndicators: false,
};

const nextConfig: NextConfig =
    process.env.NODE_ENV === "development" ? baseConfig : withPWA(baseConfig);

export default nextConfig;
