import { concatBytes } from '@noble/hashes/utils.js';

interface ScriptSignature {
    signature: Uint8Array;
    hashType: number;
}

// Taken from https://github.com/bitcoinjs/bitcoinjs-lib/blob/5d2ff1c61165932e2814d5f37630e6720168561c/ts_src/script_signature.ts#L29
export function decodeScriptSignature(buffer: Uint8Array): ScriptSignature {
    const hashType = buffer[buffer.length - 1];
    const hashTypeMod = hashType & ~0x80;
    if (hashTypeMod <= 0 || hashTypeMod >= 4)
        throw new Error('Invalid hashType ' + hashType);

    const decoded = decode2(buffer.subarray(0, -1));
    const r = fromDER(decoded.r);
    const s = fromDER(decoded.s);
    const signature = concatBytes(r, s);

    return { signature, hashType };
}

function fromDER(x: Uint8Array): Uint8Array {
    let data = x;
    if (data[0] === 0x00) data = data.subarray(1);
    const buffer = new Uint8Array(32);
    const trimmed = data.length > 32 ? data.subarray(data.length - 32) : data;
    const bstart = 32 - trimmed.length;
    buffer.set(trimmed, bstart);
    return buffer;
}

function decode2(buffer: Uint8Array) {
    if (buffer.length < 8) throw new Error('DER sequence length is too short');
    if (buffer.length > 72) throw new Error('DER sequence length is too long');
    if (buffer[0] !== 0x30) throw new Error('Expected DER sequence');
    if (buffer[1] !== buffer.length - 2)
        throw new Error('DER sequence length is invalid');
    if (buffer[2] !== 0x02) throw new Error('Expected DER integer');
    const lenR = buffer[3];
    if (lenR === 0) throw new Error('R length is zero');
    if (5 + lenR >= buffer.length) throw new Error('R length is too long');
    if (buffer[4 + lenR] !== 0x02) throw new Error('Expected DER integer (2)');
    const lenS = buffer[5 + lenR];
    if (lenS === 0) throw new Error('S length is zero');
    if (6 + lenR + lenS !== buffer.length) throw new Error('S length is invalid');
    if (buffer[4] & 0x80) throw new Error('R value is negative');
    if (lenR > 1 && buffer[4] === 0x00 && !(buffer[5] & 0x80))
        throw new Error('R value excessively padded');
    if (buffer[lenR + 6] & 0x80) throw new Error('S value is negative');
    if (lenS > 1 && buffer[lenR + 6] === 0x00 && !(buffer[lenR + 7] & 0x80))
        throw new Error('S value excessively padded');
    // non-BIP66 - extract R, S values
    return {
        r: buffer.subarray(4, 4 + lenR),
        s: buffer.subarray(6 + lenR),
    };
}
