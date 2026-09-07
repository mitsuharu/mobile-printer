module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest/setup.js'],
  // immer（@reduxjs/toolkit が依存）と AsyncStorage は ESM のみを配信して
  // いるため、プリセットの除外へ追加して babel-jest で変換する
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community|-async-storage)?|immer)/)',
  ],
  moduleNameMapper: {
    '^@op-engineering/op-sqlite$': '<rootDir>/jest/mocks/opSqlite.ts',
  },
}
