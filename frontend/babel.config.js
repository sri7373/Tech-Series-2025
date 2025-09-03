module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'], // if using Expo
      // remove the Reanimated / worklets plugin for now
      plugins: [
        // "react-native-worklets/plugin", // ❌ comment this out for now
      ],
    };
  };
  