/**
 * Usage:
 * node -r ./nodeno/nodeno.js --loader ./test-loader.js nodeno-tests/test.js <URL TO TEST>
 */
'use strict';
const colors = require('colors');
const tests = [];
module.exports = function (name, fn) {

    if (typeof name === 'object') {
        name = name.name;
        fn = name.fn;
    }

    tests.push({ name, fn });
};

const getDuration = function (start) {
    return Math.round(Number(process.hrtime.bigint() - start) * 1e-6);
}

module.exports._run = async function () {
    const failures = [];
    const tsessionStart = process.hrtime.bigint();
    const session = { passed: 0, ignored: 0, measured: 0, fout: 0 };
    console.log(`running ${tests.length} tests`);
    for (const { name, fn } of tests) {
        process.stdout.write('test ' + name + ' ... ');
        const tstart = process.hrtime.bigint();
        try {
            await fn();
            process.stdout.write(colors.yellow('ok '));
            ++session.passed;
        }
        catch (e) {
            process.stdout.write(colors.red('FAILED '));
            failures.push({ name, e });
        }
        const trun = getDuration(tstart); // nanosec to ms
        process.stdout.write(colors.gray(`(${trun}ms)\n`));
    }
    const tsession = getDuration(tsessionStart);
    console.log();

    if (failures.length > 0) {
        console.log('failures:\n');
        for (const { name, e } of failures) {
            console.log(name);
            console.log(e);
        }
    }

    if (failures.length > 0) {
        console.log('\nfailures:\n');
        for (const { name } of failures) {
            console.log('\t', name);
        }
        console.log();
    }

    const result = failures.length === 0 ? colors.yellow('ok') : colors.red('FAILED');
    const tm = colors.gray(`(${tsession}ms)`)
    console.log(`test result: ${result}. ${session.passed} passed; ${failures.length} failed; ${session.ignored} ignored; ${session.measured} measured; ${session.fout} filtered out ${tm}`);
    console.log();
    if (failures.length > 0) {
        process.exit(1);
    }
}
