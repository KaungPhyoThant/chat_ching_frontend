import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* API requests are handled by app/api route handlers (BFF + httpOnly cookie). */

  // Telegram's in-app WebView caches the mini-app document aggressively and
  // ignores the ?v= query buster, so code changes don't show until the cache
  // is evicted (hence "works on another account"). Force fresh HTML each open;
  // the hashed /_next/static chunks it references stay cacheable.
  async headers() {
    return [
      {
        source: "/telegram-shop",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
