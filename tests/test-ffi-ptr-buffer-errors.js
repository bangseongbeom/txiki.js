// Argument validation for the zero-copy view APIs.

import assert from 'tjs:assert';
import { FFI } from './helpers/ffi.js';

const { bufferToPointer, toUint8Array, toArrayBuffer } = FFI;

const buf = new Uint8Array(8);
const ptr = bufferToPointer(buf);

// A null pointer can't be turned into a view.
assert.throws(() => toUint8Array(null, 4), TypeError, 'toUint8Array rejects null');
assert.throws(() => toArrayBuffer(null, 4), TypeError, 'toArrayBuffer rejects null');

// A negative byteLength is rejected, both via the free functions and the
// NativePointer methods.
assert.throws(() => toUint8Array(ptr, -1), RangeError, 'toUint8Array rejects negative length');
assert.throws(() => toArrayBuffer(ptr, -1), RangeError, 'toArrayBuffer rejects negative length');
assert.throws(() => ptr.toUint8Array(-1), RangeError, 'method rejects negative length');
assert.throws(() => ptr.toArrayBuffer(-1), RangeError, 'method rejects negative length');
