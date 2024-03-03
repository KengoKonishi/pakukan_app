/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "next/core-web-vitals",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions":  {
    "project": "./tsconfig.json"
  },
  "plugins": [
    "import",
    "@typescript-eslint"
  ],
  "root": true,
  "rules": {
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object", "type"],
        alphabetize: {
          order: "asc",
        },
      }
    ]
  }
}  