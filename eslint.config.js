// eslint.config.js
/** @type {import('eslint').Linter.Config} */
module.exports = [
	{
		files: ["*.js"],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2021,
				sourceType: "module"
			}
		},
		rules: {
			"no-template-curly-in-string": "warn",
			eqeqeq: ["warn", "smart"],
			"no-empty-pattern": "off",
			"no-useless-catch": "off",
			"eol-last": ["warn", "always"],
			"no-const-assign": "error",
			"no-duplicate-imports": "error",
			"no-var": "warn",
			"prefer-const": ["warn", { destructuring: "all" }],
			"prefer-template": "warn",
			"no-console": "warn",
			// Disable formatting rules that Prettier will handle
			indent: "off",
			quotes: "off",
			semi: "off",
			"max-len": "off"
		}
	}
];
