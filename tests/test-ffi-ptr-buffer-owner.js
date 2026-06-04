// The `owner` option pins the JavaScript object that owns the memory so the GC
// can't reclaim it while a view is still alive.

import assert from 'tjs:assert';
import { FFI } from './helpers/ffi.js';

const { bufferToPointer, toUint8Array, toArrayBuffer } = FFI;

// A view over a JS buffer's own memory aliases it in both directions — proof
// that no copy is made.
const src = new Uint8Array([ 1, 2, 3, 4, 5, 6, 7, 8 ]);
const view = toUint8Array(bufferToPointer(src), src.length, 0, { owner: src });

assert.eq(view.length, src.length);

for (let i = 0; i < src.length; i++) {
    assert.eq(view[i], src[i], `byte ${i} aliases source`);
}

view[0] = 99;
assert.eq(src[0], 99, 'write via view visible in source');
src[7] = 77;
assert.eq(view[7], 77, 'write via source visible in view');

// With `owner` set, dropping every other reference and forcing a GC must not
// invalidate the view: the owner is kept alive through the view.
let owned = new Uint8Array([ 10, 20, 30 ]);
const ownedView = toUint8Array(bufferToPointer(owned), 3, 0, { owner: owned });

owned = null;
tjs.engine.gc.run();

assert.eq(ownedView[0], 10);
assert.eq(ownedView[1], 20);
assert.eq(ownedView[2], 30);

// `owner` works with toArrayBuffer too.
const src2 = new Uint8Array([ 5, 6, 7 ]);
const ab = toArrayBuffer(bufferToPointer(src2), src2.length, 0, { owner: src2 });

assert.ok(ab instanceof ArrayBuffer);
assert.eq(new Uint8Array(ab)[1], 6);
