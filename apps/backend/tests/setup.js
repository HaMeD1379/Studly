import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

beforeAll(async () => {
  console.log('Starting test suite...');
  process.env.NODE_ENV = 'test';

});

afterAll(async () => {
  console.log('Test suite complete');
  
});

beforeEach(() => {
  
});

afterEach(() => {
  
});

//global test utilities
global.testUtils = {
  //add helper functions here
};