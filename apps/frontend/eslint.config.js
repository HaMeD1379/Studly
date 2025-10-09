import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      'react-hooks': reactHooks,
    },
    extends: ['react-hooks/recommended'],
  },
]);