'use strict';
const cp = require('child_process');
const path = require('path');
const { pathToFileURL } = require('url');

const rPath = path.join(__dirname, '..', 'nodeno.js');
const loaderPath = pathToFileURL(
  path.join(__dirname, '..', '..', 'test-loader.js'),
);
const testScriptPath = path.join(
  __dirname,
  '..',
  '..',
  'nodeno-tests',
  'test.js',
);

function runTests(testURL) {
  process.stdout.write('TESTING ' + testURL + ' ');
  const { stdout, stderr, status } = cp.spawnSync(process.execPath, [
    '-r',
    rPath,
    '--loader',
    loaderPath,
    testScriptPath,
    testURL,
  ]);
  if (status !== 0) {
    console.log('\nFAILED', testURL);
    console.log(stdout.toString());
    console.log(stderr.toString());
  } else {
    process.stdout.write('ok\n');
  }
  return status === 0;
}

let targets = require('./test-urls.json');

const args = process.argv.slice(2);
if (args.length > 0) {
  targets = targets.filter((target) =>
    args.some((arg) => target.includes(arg)),
  );
}

const failed = [];
for (const url of targets) {
  const res = runTests('https://deno.land/std/' + url);
  if (!res) {
    failed.push(url);
  }
}

console.log('FAILED', failed.length, '/', targets.length);
console.log(
  'FAILED tests:\n',
  failed.map((x) => 'https://deno.land/std/' + x).join('\n'),
);
if (failed.length > 0) {
  process.exit(1);
}
