// Next.js settings for the VoiceLab website
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Extra React checks during development
  reactStrictMode: true,
  // Basic security headers on every page
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Stop browsers guessing file types
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Stop other sites framing the site
          { key: "X-Frame-Options", value: "DENY" },
          // Send only the site name when following links out
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The free Rapid Fire needs the microphone on this site only; no camera or location
          { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
          // Always use HTTPS once visited over it
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
