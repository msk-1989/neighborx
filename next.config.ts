import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: `output: "standalone"` is intentionally removed — it is for
  // self-hosting (Docker) and is not used by Vercel's builder. Local dev uses
  // `bun run dev` (no build step), so removing it has no local impact.
  typescript: {
    ignoreBuildErrors: true,
  },
  // NOTE: Next.js 16 removed built-in ESLint from `next build` entirely, so
  // there is no `eslint` key here. Lint runs locally via `bun run lint`.
  reactStrictMode: false,
  // Prisma's native engine must be externalized from the server bundle so it
  // loads correctly in the serverless runtime (Vercel) and in dev.
  serverExternalPackages: ["@prisma/client", "@prisma/client/runtime/library"],
};

export default nextConfig;
