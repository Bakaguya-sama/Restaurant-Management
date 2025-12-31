module.exports = {
  testEnvironment: 'node',
  testTimeout: 20000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: false,
  maxWorkers: 1,
  testMatch: [
    '**/src/test/**/*.test.js',
    '**/src/test/**/*.integration.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
