module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setup.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setupAfterEnv.js"],
  testMatch: ["**/tests/**/*.spec.js", "**/tests/**/*.int.spec.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/config/**"],
  coverageDirectory: "coverage",
  verbose: true,
  testTimeout: 30000,
  // Roda testes de integração em série para evitar conflitos no banco
  maxWorkers: 1,
};
