declare module "next-pwa" {
    import type { NextConfig } from "next";

    interface PwaOptions {
        dest?: string;
        register?: boolean;
        skipWaiting?: boolean;
        skipSWOnDev?: boolean;
        disable?: boolean;
    }

    export default function nextPwa(options?: PwaOptions): (nextConfig?: NextConfig) => NextConfig;
}
