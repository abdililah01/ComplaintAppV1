// mon-app-frontend/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,

  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath:
      process.env.NODE_ENV === 'production'
        ? require.resolve('./metro-obfuscator')
        : defaultConfig.transformer.babelTransformerPath,
  },

  resolver: {
    ...defaultConfig.resolver,
    extraNodeModules: {
      // alias any `require('babylon')` calls inside the obfuscator to @babel/parser
      babylon: path.resolve(__dirname, 'node_modules/@babel/parser'),
      ...defaultConfig.resolver.extraNodeModules,
    },
  },
};
