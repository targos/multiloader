import * as uuid from 'https://deno.land/std/uuid/mod.ts';
console.log(uuid);

console.log(uuid.NIL_UUID);
console.log(uuid.isNil(uuid.NIL_UUID));
console.log(uuid.isNil('lol'));
const v1 = uuid.v1.generate();
console.log(v1);
console.log(uuid.v1.validate(v1));
const v4 = uuid.v4.generate();
console.log(v4);
console.log(uuid.v4.validate(v4));
const v5 = uuid.v5.generate({ namespace: uuid.NIL_UUID });
console.log(v5);
console.log(uuid.v5.validate(v5));
