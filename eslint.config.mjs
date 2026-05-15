import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const config = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // New strict hook rules introduced in react-hooks v5 / Next.js 16.
      // Many async-fetch-in-effect patterns are valid but trigger these rules.
      // Downgrade to warnings until the codebase can be incrementally refactored.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      // Allow _-prefixed names to be unused (intentional discard pattern).
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
      }],
    },
  },
]

export default config
