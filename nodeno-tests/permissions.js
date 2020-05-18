import * as permissions from 'https://deno.land/std/permissions/mod.ts';
console.log(permissions);

permissions.grant({ name: 'net' }).then(() => {
  console.log('permission granted!');
});

permissions.grantOrThrow([{ name: 'net' }, { name: 'env' }]).then(() => {
  console.log('permission granted!');
});
