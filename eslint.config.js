const js = require('@eslint/js');
const globals = require('globals');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.expo/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.cache/**',
      '**/drizzle/**'
    ]
  },
  js.configs.recommended,
  {
    files: ['eslint.config.js', 'frontend/babel.config.js'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.node
      },
      sourceType: 'commonjs'
    }
  },
  {
    files: ['backend/**/*.js', 'backend/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.node
      },
      sourceType: 'commonjs'
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.node
      },
      sourceType: 'module'
    }
  },
  {
    files: ['backend/**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  },
  {
    files: ['frontend/**/*.js', 'frontend/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        ...globals.es2023,
        ...globals.browser,
        process: 'readonly',
        require: 'readonly'
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      sourceType: 'module'
    },
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/refs': 'off'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  }
];
