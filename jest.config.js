module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: ["src/services/*.ts"],
  verbose: true,
  coverageThreshold: {
    "src/index.ts": {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
