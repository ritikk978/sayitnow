import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  env: {
    // Make environment variables available to the browser
    // Be careful not to expose sensitive credentials to the browser
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    GOOGLE_APPLICATION_CREDENTIALS_JSON: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
  },

  
};

export default nextConfig;
