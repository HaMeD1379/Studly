import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    retries: {
      runMode: 1,
      openMode: 0
    }
  }
});
