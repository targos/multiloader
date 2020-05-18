import * as asserts from 'https://deno.land/std/testing/asserts.ts';
console.log(asserts);

asserts.assert(true);
console.log(asserts.equal(42, 42));
console.log(asserts.equal(Deno, Deno));
console.log(asserts.equal(Deno, process));
asserts.assertEquals(Deno, Deno);
asserts.assertNotEquals(Deno, process);
asserts.assertEquals({ a: 'b' }, { a: 'b' });
asserts.assertNotEquals({ a: 'b' }, { a: 'c' });
asserts.assertStrictEq(Deno, Deno);
asserts.assertStrContains('abcde', 'bc');
asserts.assertArrayContains([42, 'my value'], ['my value']);
asserts.assertMatch('ABC', /b/i);
try {
  asserts.fail('message');
} catch (e) {
  console.log(`failed with ${e.message}`);
}
asserts.assertThrows(
  () => {
    throw new TypeError('boom');
  },
  TypeError,
  'boom',
);
asserts
  .assertThrowsAsync(
    () => Promise.reject(new Error('promise')),
    Error,
    'promise',
  )
  .then(() => console.log('rejected a promise'));
