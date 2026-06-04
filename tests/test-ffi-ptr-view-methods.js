// The NativePointer.toUint8Array / toArrayBuffer methods are the ergonomic
// equivalents of the free functions and create the same zero-copy views.

import assert from 'tjs:assert';
import { FFI, sopath } from './helpers/ffi.js';

const { read } = FFI;

const lib = new FFI.Lib(sopath);
const intPtr = lib.symbol('test_int').addr;

// Uint8Array method.
const view = intPtr.toUint8Array(4);
assert.ok(view instanceof Uint8Array);
assert.eq(view.length, 4);

for (let i = 0; i < 4; i++) {
    assert.eq(view[i], read.u8(intPtr, i), `byte ${i} matches read.u8`);
}

// ArrayBuffer method.
const ab = intPtr.toArrayBuffer(4);
assert.ok(ab instanceof ArrayBuffer);
assert.eq(ab.byteLength, 4);

// byteOffset argument.
const tail = intPtr.toUint8Array(2, 1);
assert.eq(tail.length, 2);
assert.eq(tail[0], read.u8(intPtr, 1));

// Writing through a method-created view is visible to native reads.
const orig = view.slice();

view[1] = 0x5a;
assert.eq(read.u8(intPtr, 1), 0x5a, 'write through method view is visible');
view.set(orig);

lib.close();
