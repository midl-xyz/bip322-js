import { bytesToHex, concatBytes, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';

/**
 * Class that implement byte-related utility functions.
 */
class BufferUtil {

    /**
     * Ensures the input is a Uint8Array.
     * If the input is already a Uint8Array, it is returned unchanged.
     * Otherwise, it wraps the ArrayBuffer with Uint8Array.
     *
     * @param val - The value to normalize as a Uint8Array.
     * @returns A Uint8Array instance containing the same data.
     */
    public static ensureBuffer(val: Uint8Array | ArrayBuffer): Uint8Array {
        return val instanceof Uint8Array ? val : new Uint8Array(val);
    }

    /**
     * Concatenate multiple byte arrays.
     */
    public static concat(...parts: Uint8Array[]): Uint8Array {
        return concatBytes(...parts);
    }

    /**
     * Convert a UTF-8 string into bytes.
     */
    public static fromUtf8(value: string): Uint8Array {
        return utf8ToBytes(value);
    }

    /**
     * Convert bytes into a UTF-8 string.
     */
    public static toUtf8(value: Uint8Array): string {
        return new TextDecoder().decode(value);
    }

    /**
     * Convert a hex string into bytes.
     */
    public static fromHex(value: string): Uint8Array {
        return hexToBytes(value);
    }

    /**
     * Convert bytes into a hex string.
     */
    public static toHex(value: Uint8Array): string {
        return bytesToHex(value);
    }

    /**
     * Convert a base64 string into bytes.
     */
    public static fromBase64(value: string): Uint8Array {
        return base64ToBytes(value);
    }

    /**
     * Convert bytes into a base64 string.
     */
    public static toBase64(value: Uint8Array): string {
        return bytesToBase64(value);
    }

    /**
     * Byte-wise equality check.
     */
    public static equals(a: Uint8Array, b: Uint8Array): boolean {
        return a.length === b.length && this.compare(a, b) === 0;
    }

    /**
     * Lexicographically compare two byte arrays.
     * Returns -1, 0, or 1 for lexicographic ordering.
     */
    public static compare(a: Uint8Array, b: Uint8Array): number {
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
            if (a[i] !== b[i]) {
                return a[i] < b[i] ? -1 : 1;
            }
        }
        if (a.length === b.length) return 0;
        return a.length < b.length ? -1 : 1;
    }

}

function base64ToBytes(value: string): Uint8Array {
    if (typeof atob !== 'function') {
        throw new Error('Base64 decoding is not available in this environment.');
    }
    const binary = atob(value);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        out[i] = binary.charCodeAt(i);
    }
    return out;
}

function bytesToBase64(value: Uint8Array): string {
    if (typeof btoa !== 'function') {
        throw new Error('Base64 encoding is not available in this environment.');
    }
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < value.length; i += chunkSize) {
        const chunk = value.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
}

export default BufferUtil;
