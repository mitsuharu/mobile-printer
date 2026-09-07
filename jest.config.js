module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest/setup.js'],
  // @reduxjs/toolkit が依存する immer は ESM のみを配信しているため、
  // プリセットの除外へ追加して babel-jest で変換する
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|immer)/)',
  ],
  moduleNameMapper: {
    '^@op-engineering/op-sqlite$': '<rootDir>/jest/mocks/opSqlite.ts',
  },
}
