module.exports = {
  root: true,
  extends: [
    '@react-native',
    'airbnb-typescript',
    "plugin:@typescript-eslint/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:import/react-native",
    "plugin:react-native/all",
    "prettier",
  ],
  plugins: [],
  parserOptions: {
    project: 'tsconfig.json',
  },
  settings: {
    "import/resolver": {
      "typescript": {
        project: 'tsconfig.json',
      }
    },
  },
  rules: {
    "no-console": ["error", { allow: ["log", "warn", "error"] }],
    "import/prefer-default-export": "off",
    "lines-between-class-members": "off",
    "react-native/sort-styles": "off",
    "no-continue": "warn",
    "prefer-destructuring": "warn",
    "no-param-reassign": "warn",
    "require-yield": "warn",
    "curly": ["error", "all"],
    "no-underscore-dangle": "off",
    "class-methods-use-this": "warn",
    "@typescript-eslint/no-inferrable-types": ["error", {
      ignoreParameters: true,
      ignoreProperties: true,
    }],
    "import/no-unresolved": ["error", {
      ignore: [
        // なぜか解決できない TODO: v6にあげたときに再チェックする
        '^react-native-firebase/.*',
        // svgはエラーになる
        '\.svg'
      ]
    }],
    "no-plusplus": ["error", {
      "allowForLoopAfterthoughts": true,
    }],
    "no-irregular-whitespace": ["error", {
      "skipComments": true,
    }],
    "global-require": 'off',
    "@typescript-eslint/no-var-requires": 'off',

    // arrow function を使っていると正しい指摘ができない
    // see: https://github.com/yannickcr/eslint-plugin-react/issues/2353
    "react/prop-types": 'off',

    "yoda": ["error", "never", { "exceptRange": true }],
    "react/jsx-props-no-spreading": "off",
    "no-nested-ternary": "warn",
    // 本来は禁止したいが、swagger-apiやreducerのテストコードで明示的なundefinedを宣言する必要がある為warnに設定した
    "no-undefined": "warn",

    // 'ForOfStatement' 不要.
    // see: https://qiita.com/putan/items/0c0037ce00d21854a8d0#comment-f54f6b228c89da0ebf63
    // see: https://github.com/airbnb/javascript/blob/06b3ab11d9a443ff46f052dd00375e271e5146e6/packages/eslint-config-airbnb-base/rules/style.js#L334
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      // {
      //   selector: 'ForOfStatement',
      //   message: 'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
      // },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],

    // typescript
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-throw-literal": "warn",
    "@typescript-eslint/lines-between-class-members": "off",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "class",
        "format": ["PascalCase"],
      },
      {
        "selector": "typeAlias",
        "format": ["PascalCase"],
      },
      {
        "selector": "typeParameter",
        "format": ["PascalCase"],
      },
      {
        "selector": "property",
        "format": ['snake_case', "camelCase", "PascalCase", "UPPER_CASE"],
        "filter": {
          "regex": "^_.*",
          "match": false,
        },
      },
      {
        "selector": "parameter",
        "format": ["camelCase", "PascalCase"],
        "filter": {
          "regex": "^_.*",
          "match": false,
        },
      },
      {
        "selector": "variable",
        "format": ["camelCase", "PascalCase", "UPPER_CASE"],
        "leadingUnderscore": "allow",
        "trailingUnderscore": "allow",
        "filter": {
          "regex": "^sns_.*",
          "match": false,
        },
      },
     ],
    "@typescript-eslint/explicit-module-boundary-types": "off",

    // Dependency cycleを検出 TODO: 将来 error として扱う
    "import/no-cycle": "warn",
    // `return await ...` ないしは `() => await ...` を検出 TODO: 将来 error として扱う
    "no-return-await": "warn",
    // 1ファイルで複数のクラス定義を検出 TODO: 将来 error として扱う
    "max-classes-per-file": "warn",
    // deprecatedメソッドを検出 TODO: 将来 error として扱う
    "react/no-deprecated": "warn",
    // propsはobject destructuringを使うよう検出 TODO: 将来 error として扱う
    "react/destructuring-assignment": "warn",
    // Object#hasOwnProperty 等のメソッドを検出 TODO: 将来 error として扱う
    "no-prototype-builtins": "warn",
    // スタイルシートへの色の直書きを検出 TODO: 将来 error として扱う
    "react-native/no-color-literals": "warn",
    // renderしかないclass componentを検出 TODO: 将来 error として扱う
    "react/prefer-stateless-function": "warn",
    
    // ここから 誤検知をしているためやむを得ずoffにする TODO: 将来有効に戻す
    "react/no-unused-prop-types": "off",
    "react/require-default-props": "off",
    "react-native/no-raw-text": "off",
    // ここまで
  }
};
