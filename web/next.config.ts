import type { NextConfig } from "next";
import nextPwa from "next-pwa";

const withPWA = nextPwa({
    dest: "public",
    register: true,
    disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = withPWA({});

export default nextConfig;
