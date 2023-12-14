// setup dayjs extension
import '@/utils/dayjsPlugins'

// suppress console.log and warn
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: console.error,
  info: console.info,
  debug: console.debug,
};
