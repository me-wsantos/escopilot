/** @type {import('next').NextConfig} */
const nextConfig = {
  // applicationinsights uses native Node modules – keep them as externals
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("applicationinsights");
    }
    return config;
  },
};

export default nextConfig;
