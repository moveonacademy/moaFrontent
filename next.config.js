module.exports = {
  webpack: (config,isServer) => {
    config.resolve.alias.canvas = false;
    config.experiments = { ...config.experiments,  topLevelAwait: true };
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },
  reactStrictMode: true
};
