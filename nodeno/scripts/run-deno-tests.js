'use strict';
const cp = require('child_process');
const path = require('path');

const rPath = path.join(__dirname, '..', 'nodeno.js');
const loaderPath = path.join(__dirname, '..', '..', 'test-loader.js');
const testScriptPath = path.join(__dirname, '..', '..', 'nodeno-tests', 'test.js');

function runTests(testURL) {

    process.stdout.write('TESTING ' + testURL + ' ');
    const  { stdout, stderr, status } = cp.spawnSync('node', ['-r', rPath, '--loader', loaderPath, testScriptPath, testURL]);
    if (status !== 0) {
        console.log('\nFAILED', testURL);
        console.log(stdout.toString());
        console.log(stderr.toString());
    }
    else {
        process.stdout.write('ok\n');
    }
    return status === 0;
}

const targets = require('./test-urls.json');
const failed = [];
for (const url of targets) {
    const res = runTests('https://deno.land/std/' + url);
    if(!res) {
        failed.push(url);
    }
}

console.log('FAILED', failed.length, '/', targets.length);
console.log('FAILED tests:\n', failed.map((x) => 'https://deno.land/std/' + x).join('\n'));
