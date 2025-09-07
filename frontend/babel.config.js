module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Remove the old react-native-reanimated/plugin if it exists
      // The new version doesn't need the plugin for basic functionality
    ],
  };
};
