module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/config.js',
  ],
  coverageDirectory: 'coverage',
};
