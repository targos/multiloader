'use strict';
const childProcess = require('child_process');

module.exports.Process = class Process {
    #proc;
    #finished;
    #code;
    #signal;

    constructor(proc) {
        this.rid = proc.pid; // It's internal Deno resource id, let's use pid
        this.pid = proc.pid;
        this.#proc = proc;
        this.stdin = proc.stdin;
        this.stdout = proc.stdout;
        this.stderr = proc.stderr;
        this.#finished = false;
    }

    status() {
        // TODO: https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts#Deno.ProcessStatus
        if (this.#finished) {
            return Promise.resolve({ success: this.#code === 0, code: this.#code, signal: this.#signal });
        }
        return new Promise((resolve) => {
            this.#proc.on('exit', (code, signal) => {
                this.#finished = true;
                this.#code = code;
                this.#signal = signal;
                resolve({ success: this.#code === 0, code: this.#code, signal: this.#signal });
            });
        });
    }

    output() {
        const buffers = [];
        return new Promise((resolve) => {
            this.stdout.on('data', (dta) => {
                buffers.push(dta);
            });
            this.stdout.on('end', () => {
               const str = Buffer.concat(buffers).toString();
               resolve(new TextEncoder().encode(str));
            });
        });
    }

    stderrOutput() {
        const buffers = [];
        return new Promise((resolve) => {
            this.stderr.on('data', (dta) => {
                buffers.push(dta);
            });
            this.stderr.on('end', () => {
                const str = Buffer.concat(buffers).toString();
                resolve(new TextEncoder().encode(str));
            });
        });
    }

    close() {
        // close the resource, let's ignore for now
    }

    kill(signal) {
        return this.#proc.kill(signal);
    }
};

module.exports.run = function (options) {
    const cmd = options.cmd.shift;
    const args = options.cmd;
    const cwd = options.cwd || process.cwd();
    const env = options.env || process.env;

    // could also be "pipe" -> TODO: check how this works
    const stdout = options.stdout || 'inherit';
    const stderr = options.stderr || 'inherit';
    const stdin = options.stdin || 'inherit';

    const proc = childProcess.spawn(cmd, args, { cwd, env });
    if (stdout === 'inherit') {
        proc.stdout.pipe(process.stdout);
    }
    if (stderr === 'inherit') {
        proc.stderr.pipe(process.stderr);
    }
    if (stdin === 'inherit') {
        process.stdin.pipe(proc.stdin);
    }
    return new Process(proc);
};

