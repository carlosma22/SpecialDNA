module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/src/controllers/',
    '<rootDir>/src/dtos/',
    '<rootDir>/src/utils/',
    '<rootDir>/src/main.ts',
  ],
};
