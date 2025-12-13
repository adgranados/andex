/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  webpack: (config) => {
    config.experiments ??= {};
    config.experiments.asyncWebAssembly = true;

    config.module.rules.push({
      test: /\.wasm$/i,
      type: 'webassembly/async'
    });

    return config;
  }
};

export default nextConfig;
