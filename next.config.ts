import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

// A fresh revision per build so installed apps pick up new HTML after a deploy.
const revision = randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Static export pages aren't in webpack's manifest, so precache them explicitly.
  additionalPrecacheEntries: ["/", "/awards", "/parent", "/manifest.webmanifest"].map((url) => ({
    url,
    revision,
  })),
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default withSerwist(nextConfig);
