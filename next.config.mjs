/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/ph",
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
