const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // Without this, jsdom's default export-condition resolution picks the
  // "browser" build of isomorphic packages like @google/genai (which is
  // ESM-only and imports other ESM-only deps) even though tests actually
  // run in Node via Jest -- forcing "node" makes it resolve the CJS build.
  testEnvironmentOptions: {
    customExportConditions: ['node'],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};

module.exports = createJestConfig(customJestConfig);
