// react-native-reanimated はネイティブを必要とするため、公式のモックを使う
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
)

// suppress console.log and warn
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: console.error,
  info: console.info,
  debug: console.debug,
}
