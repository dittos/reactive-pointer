const { expect } = require('chai');
const { ptrOf } = require('..');

describe('Ptr', () => {
  it('works', () => {
    const numberPtr = ptrOf(42);
    expect(numberPtr.get()).to.equal(42);

    numberPtr.set(999);
    expect(numberPtr.get()).to.equal(999);

    let calls = 0;
    numberPtr.changes().subscribe(() => {
      calls++;
    });
    numberPtr.set(123);
    numberPtr.set(456);
    expect(calls).to.equal(2);
  });

  it('should be mappable', () => {
    const numberPtr = ptrOf(42);
    const doublePtr = numberPtr.map(x => x * 2);
    const doubleSuccPtr = doublePtr.map(x => x + 1);

    expect(doublePtr.get()).to.equal(42 * 2);
    expect(doubleSuccPtr.get()).to.equal(42 * 2 + 1);
  });
});
