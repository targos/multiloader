'use strict';
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This code has been ported almost directly from Go's src/bytes/buffer.go
// Copyright 2009 The Go Authors. All rights reserved. BSD license.
// https://github.com/golang/go/blob/master/LICENSE

const assert = require('assert');

// MIN_READ is the minimum ArrayBuffer size passed to a read call by
// buffer.ReadFrom. As long as the Buffer has at least MIN_READ bytes beyond
// what is required to hold the contents of r, readFrom() will not grow the
// underlying buffer.
const MIN_READ = 512;
const MAX_SIZE = 2 ** 32 - 2;

// `off` is the offset into `dst` where it will at which to begin writing values
// from `src`.
// Returns the number of bytes copied.
function copyBytes(src, dst, off = 0) {
    const r = dst.byteLength - off;
    if (src.byteLength > r) {
        src = src.subarray(0, r);
    }
    dst.set(src, off);
    return src.byteLength;
}

module.exports = class Buffer {
    #buf; // contents are the bytes buf[off : len(buf)]
    #off = 0; // read at buf[off], write at buf[buf.byteLength]

    constructor(ab) {
        if (ab == null) {
            this.#buf = new Uint8Array(0);
            return;
        }

        this.#buf = new Uint8Array(ab);
    }

    bytes() {
        return this.#buf.subarray(this.#off);
    }

    empty() {
        return this.#buf.byteLength <= this.#off;
    }

    get length() {
        return this.#buf.byteLength - this.#off;
    }

    get capacity() {
        return this.#buf.buffer.byteLength;
    }

    truncate(n) {
        if (n === 0) {
            this.reset();
            return;
        }
        if (n < 0 || n > this.length) {
            throw Error("bytes.Buffer: truncation out of range");
        }
        this.#reslice(this.#off + n);
    }

    reset() {
        this.#reslice(0);
        this.#off = 0;
    }

    #tryGrowByReslice = (n) => {
        const l = this.#buf.byteLength;
        if (n <= this.capacity - l) {
            this.#reslice(l + n);
            return l;
        }
        return -1;
    };

    #reslice = (len) => {
        assert(len <= this.#buf.buffer.byteLength);
        this.#buf = new Uint8Array(this.#buf.buffer, 0, len);
    };

    readSync(p) {
        if (this.empty()) {
            // Buffer is empty, reset to recover space.
            this.reset();
            if (p.byteLength === 0) {
                // this edge case is tested in 'bufferReadEmptyAtEOF' test
                return 0;
            }
            return null;
        }
        const nread = copyBytes(this.#buf.subarray(this.#off), p);
        this.#off += nread;
        return nread;
    }

    read(p) {
        const rr = this.readSync(p);
        return Promise.resolve(rr);
    }

    writeSync(p) {
        const m = this.#grow(p.byteLength);
        return copyBytes(p, this.#buf, m);
    }

    write(p) {
        const n = this.writeSync(p);
        return Promise.resolve(n);
    }

    #grow = (n) => {
        const m = this.length;
        // If buffer is empty, reset to recover space.
        if (m === 0 && this.#off !== 0) {
            this.reset();
        }
        // Fast: Try to grow by means of a reslice.
        const i = this.#tryGrowByReslice(n);
        if (i >= 0) {
            return i;
        }
        const c = this.capacity;
        if (n <= Math.floor(c / 2) - m) {
            // We can slide things down instead of allocating a new
            // ArrayBuffer. We only need m+n <= c to slide, but
            // we instead let capacity get twice as large so we
            // don't spend all our time copying.
            copyBytes(this.#buf.subarray(this.#off), this.#buf);
        } else if (c > MAX_SIZE - c - n) {
            throw new Error("The buffer cannot be grown beyond the maximum size.");
        } else {
            // Not enough space anywhere, we need to allocate.
            const buf = new Uint8Array(2 * c + n);
            copyBytes(this.#buf.subarray(this.#off), buf);
            this.#buf = buf;
        }
        // Restore this.#off and len(this.#buf).
        this.#off = 0;
        this.#reslice(m + n);
        return m;
    };

    grow(n) {
        if (n < 0) {
            throw Error("Buffer.grow: negative count");
        }
        const m = this.#grow(n);
        this.#reslice(m);
    }

    async readFrom(r) {
        let n = 0;
        while (true) {
            try {
                const i = this.#grow(MIN_READ);
                this.#reslice(i);
                const fub = new Uint8Array(this.#buf.buffer, i);
                const nread = await r.read(fub);
                if (nread === null) {
                    return n;
                }
                this.#reslice(i + nread);
                n += nread;
            } catch (e) {
                return n;
            }
        }
    }

    readFromSync(r) {
        let n = 0;
        while (true) {
            try {
                const i = this.#grow(MIN_READ);
                this.#reslice(i);
                const fub = new Uint8Array(this.#buf.buffer, i);
                const nread = r.readSync(fub);
                if (nread === null) {
                    return n;
                }
                this.#reslice(i + nread);
                n += nread;
            } catch (e) {
                return n;
            }
        }
    }
}

module.exports.readAll = async function readAll(r) {
    const buf = new Buffer();
    await buf.readFrom(r);
    return buf.bytes();
}

module.exports.readAllSync = function readAllSync(r) {
    const buf = new Buffer();
    buf.readFromSync(r);
    return buf.bytes();
}

module.exports.writeAll = async function writeAll(w, arr) {
    let nwritten = 0;
    while (nwritten < arr.length) {
        nwritten += await w.write(arr.subarray(nwritten));
    }
}

module.exports.writeAllSync = function writeAllSync(w, arr) {
    let nwritten = 0;
    while (nwritten < arr.length) {
        nwritten += w.writeSync(arr.subarray(nwritten));
    }
}
