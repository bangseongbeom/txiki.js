// detachBuffer() invalidates a zero-copy view without reading or freeing the
// underlying native memory, turning a potential use-after-free into a harmless
// empty buffer.

import assert from 'tjs:assert';
import { FFI, sopath } from './helpers/ffi.js';

const { toUint8Array, toArrayBuffer, detachBuffer, read } = FFI;

const lib = new FFI.Lib(sopath);
const intPtr = lib.symbol('test_int').addr;

// Detaching an ArrayBuffer view invalidates it.
const ab = toArrayBuffer(intPtr, 4);
assert.eq(ab.detached, false);
assert.eq(ab.byteLength, 4);

detachBuffer(ab);

assert.eq(ab.detached, true, 'buffer is detached');
assert.eq(ab.byteLength, 0, 'detached buffer has zero length');

// Detaching the .buffer of a Uint8Array view neutralizes the typed array too.
const u8 = toUint8Array(intPtr, 4);
assert.eq(u8.length, 4);

detachBuffer(u8.buffer);

assert.eq(u8.length, 0, 'typed array over detached buffer is empty');
assert.eq(u8[0], undefined, 'indexed read returns undefined, not freed memory');

// The native memory itself is untouched: a fresh view still reads it.
assert.eq(read.i32(intPtr), 123, 'detach did not free or corrupt the memory');

// detachBuffer accepts only ArrayBuffer.
assert.throws(() => detachBuffer(new Uint8Array(4)), TypeError, 'rejects TypedArray');
assert.throws(() => detachBuffer(123), TypeError, 'rejects non-buffer');

// Detaching an already-detached buffer is a harmless no-op.
detachBuffer(ab);
assert.eq(ab.detached, true);

lib.close();
