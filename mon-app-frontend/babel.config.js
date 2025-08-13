// babel.config.js
module.exports = function (api) {
  api.cache(true);

  const envFile = process.env.APP_ENV === 'staging' ? '.env.staging' : '.env.local';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: envFile,
          safe: false,
          allowUndefined: false,
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: { '@': './src' },
          extensions: [
            '.ios.js',
            '.android.js',
            '.js',
            '.jsx',
            '.json',
            '.ts',
            '.tsx',
          ],
        },
      ],

      // MUST be last for Reanimated to work
      'react-native-reanimated/plugin',
    ],
  };
};
