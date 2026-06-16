import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "niltkbrsuccfwlaistrz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "arkanfoodsegypt.com" },
      { protocol: "https", hostname: "arabfoodstuff.com" },
      { protocol: "https", hostname: "mcprod.spinneys-egypt.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "cdnimg.webstaurantstore.com" },
      { protocol: "https", hostname: "www.nestleprofessionalmena.com" },
    ],
  },
};

export default nextConfig;
