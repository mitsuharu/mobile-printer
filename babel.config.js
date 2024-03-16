module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ["module-resolver", {
      root: ["./"],
      alias: {
        "@": "./src",
        "@images": "./images",
      },
      extensions: [
        ".js",
      ]
    }],
    ["@babel/plugin-proposal-decorators", {
      "legacy": true
    }],
    "optional-require",
    "lodash",
  ],
  env: {
    production: {
      plugins: [
        "transform-remove-console", 
        "react-native-paper/babel",
      ]
    }
  }
};
