/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { externalDir: true },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Avoid optional React Native deps pulled by MetaMask SDK (via @wagmi/connectors)
      '@react-native-async-storage/async-storage': false,
      // Silence optional pretty logger from pino (WalletConnect)
      'pino-pretty': false,
    };
    return config;
  },
};

module.exports = nextConfig;

