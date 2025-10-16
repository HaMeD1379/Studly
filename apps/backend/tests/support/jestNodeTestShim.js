const jestTest = globalThis.test;
const jestDescribe = globalThis.describe;
const jestIt = globalThis.it ?? globalThis.test;
const jestBeforeEach = globalThis.beforeEach;
const jestAfterEach = globalThis.afterEach;
const jestMock = globalThis.jest;

if (!jestTest) {
  throw new Error('Jest test globals are required for the node:test shim.');
}

const createTestContext = (name) => ({
  name,
  diagnostic: () => {},
  cleanup: async (fn) => {
    await fn?.();
  },
  runOnlyPending: false,
  skip: () => {},
  todo: () => {},
  signal: undefined,
  test: async (_name, fn) => {
    if (typeof fn === 'function') {
      await fn();
    }
  },
});

const wrapCallback = (name, fn) => {
  if (typeof fn !== 'function') {
    return undefined;
  }

  if (fn.length > 0) {
    return () => fn(createTestContext(name));
  }

  return fn;
};

const test = (name, fn) => jestTest(name, wrapCallback(name, fn));

test.skip = (name, fn) => jestTest.skip(name, wrapCallback(name, fn));
test.only = (name, fn) => jestTest.only(name, wrapCallback(name, fn));
test.todo = (name) => jestTest.todo(name);

test.each = (...args) => (jestTest.each ? jestTest.each(...args) : jestTest(...args));
test.concurrent = (...args) => (jestTest.concurrent ? jestTest.concurrent(...args) : jestTest(...args));

const describe = (...args) => jestDescribe(...args);
describe.skip = (...args) => jestDescribe.skip(...args);
describe.only = (...args) => jestDescribe.only(...args);

test.describe = describe;

const it = (name, fn) => jestIt(name, wrapCallback(name, fn));
it.skip = (name, fn) => jestIt.skip(name, wrapCallback(name, fn));
it.only = (name, fn) => jestIt.only(name, wrapCallback(name, fn));
it.todo = (name) => jestIt.todo(name);

const beforeEach = (fn) => jestBeforeEach?.(wrapCallback(beforeEach.name, fn));
const afterEach = (fn) => jestAfterEach?.(wrapCallback(afterEach.name, fn));

const mock = {
  fn: (impl) => {
    if (!jestMock) {
      throw new Error('Jest mock globals are unavailable.');
    }
    return jestMock.fn(impl);
  },
};

export { test as default, test, describe, it, beforeEach, afterEach, mock };
