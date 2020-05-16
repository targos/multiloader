import { Sha256 } from 'https://deno.land/std/hash/sha256.ts';

const sha = new Sha256();

sha.update('done');

console.log(sha.hex());
