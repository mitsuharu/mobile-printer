module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest/setup.js'],
  moduleNameMapper: {
    '^@op-engineering/op-sqlite$': '<rootDir>/jest/mocks/opSqlite.ts',
  },
}
