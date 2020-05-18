import * as bench from 'https://deno.land/std/testing/bench.ts';
console.log(bench);

bench.bench(function forIncrementX1e9(b) {
  b.start();
  for (let i = 0; i < 1e9; i++);
  b.stop();
});

bench.runIfMain({ main: true });
