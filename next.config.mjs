/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
          serverComponentsExternalPackages: ['twilio'],
    },
    typescript: {
          ignoreBuildErrors: true,
    },
    eslint: {
          ignoreDuringBuilds: true,
    },
};

export default nextConfig;
