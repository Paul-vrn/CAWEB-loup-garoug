module.exports = {
  preset: "ts-jest",
  rootDir: "./",
  testEnvironment: "node",
  coverageDirectory: "coverage",
  coverageReporters: ["json-summary", "text", "lcov"],
  roots: ["<rootDir>/src"],
  transform: {
    ".(ts|tsx)": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
