/** @type {import('next').NextConfig} */
const nextConfig = {
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
