/**
 * Usage:
 * node -r ./nodeno/nodeno.js --loader ./test-loader.js nodeno-tests/test.js <URL TO TEST>
 */
'use strict';
const url = process.argv.slice(-1)[0];

const main = async function () {
    await import(url); // load all tests
    return Deno.test._run();
};

main().catch((e) => {

    console.log(e);
    process.exit(1)
});
