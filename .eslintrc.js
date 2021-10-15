module.exports = {
  env: {
    node: true,
  },
  extends: ["plugin:@typescript-eslint/recommended",
    //"plugin:prettier/recommended",
    "plugin:import/typescript"],
  plugins: ["@typescript-eslint/eslint-plugin", 'jest',
    'import'],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module"
  },
  rules: {
    "no-console": ["error", { allow: ["warn"] }]
  },
};
