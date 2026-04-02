/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 🛡️ Content Security Policy (basic safe version)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },

          // 🛡️ Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },

          // 🛡️ MIME sniffing protection
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },

          // 🛡️ Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          // 🛡️ COOP (what Lighthouse flagged)
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
