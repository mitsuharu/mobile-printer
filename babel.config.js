module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@images': './images',
        },
        extensions: ['.js'],
      },
    ],
    'optional-require',
    'lodash',
    // react-native-reanimated が使う worklets のプラグインは最後に置く
    'react-native-worklets/plugin',
  ],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
}
