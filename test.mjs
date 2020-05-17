import { Sha256 } from 'https://deno.land/std/hash/sha256.ts';
const sha = new Sha256();
sha.update('done');
console.log(sha.hex());

import linters from 'https://raw.githubusercontent.com/nodejs/node/master/.github/workflows/linters.yml';
console.log(linters);
