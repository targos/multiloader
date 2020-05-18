// import { Sha256 } from 'https://deno.land/std/hash/sha256.ts';
// const sha = new Sha256();
// sha.update('done');
// console.log(sha.hex());

// import { decode, encode } from 'https://deno.land/std/encoding/utf8.ts';
// console.log(decode(encode('test')));

// import {
//   parse as parseToml,
//   stringify as stringifyToml,
// } from 'https://deno.land/std/encoding/toml.ts';
// console.log(stringifyToml(parseToml('test=1')));

// import { parse as parseCsv } from 'https://deno.land/std/encoding/csv.ts';
// parseCsv('test,a,b\n1,2,3\n4,5,6').then(console.log, console.error);

// import { readFileSync } from 'https://deno.land/std/node/fs.ts';
// console.log(readFileSync('./nodeno/nodeno.js').toString());

// import * as uuid from 'https://deno.land/std/uuid/mod.ts';
// console.log(uuid);
// console.log(uuid.NIL_UUID);
// console.log(uuid.isNil(uuid.NIL_UUID));
// console.log(uuid.isNil('lol'));
// const v1 = uuid.v1.generate();
// console.log(v1);
// console.log(uuid.v1.validate(v1));
// const v4 = uuid.v4.generate();
// console.log(v4);
// console.log(uuid.v4.validate(v4));
// const v5 = uuid.v5.generate({ namespace: uuid.NIL_UUID });
// console.log(v5);
// console.log(uuid.v5.validate(v5));
