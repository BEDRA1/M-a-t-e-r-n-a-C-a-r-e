import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // شارة أدوات التطوير الافتراضية (bottom-left) تتراكب فعليًا مع زر "حسابي" في
  // DashboardBottomNav (آخر عنصر RTL يظهر أقصى اليسار، نفس زاوية الشارة) وتحجب الضغط
  // عليه في وضع dev — لا تظهر أصلًا في build الإنتاج، لكن نقلها لأعلى يمنع التعارض أثناء التطوير
  devIndicators: {
    position: "top-left",
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
