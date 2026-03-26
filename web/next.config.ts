import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipSWOnDev: true,
});
const nextConfig = withPWA({});

export default nextConfig;
