/**
 * Class that implement variable length integer (VarInt) in Javascript. 
 * Reference: https://en.bitcoin.it/wiki/Protocol_documentation#Variable_length_integer
 */
class VarInt {

    /**
     * Encode an integer i as a variable length integer.
     * Reference: https://github.com/buidl-bitcoin/buidl-python/blob/d79e9808e8ca60975d315be41293cb40d968626d/buidl/helper.py#L180
     * @param i Integer to be encoded
     * @returns Encoded varint
     */
    public static encode(i: number): Uint8Array {
        if (i < 0xFD) {
            const buffer = new Uint8Array(1);
            buffer[0] = i;
            return buffer;
        }
        else if (i < 0x10000) {
            const buffer = new Uint8Array(3);
            const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            view.setUint8(0, 0xfd);
            view.setUint16(1, i, true);
            return buffer;
        }
        else if (i < 0x100000000) {
            const buffer = new Uint8Array(5);
            const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            view.setUint8(0, 0xfe);
            view.setUint32(1, i, true);
            return buffer;
        }
        else if (i < 0x1000000000000) {
            const buffer = new Uint8Array(9);
            buffer[0] = 0xff;
            // Write 6 bytes little-endian (Node's writeUIntLE with length 6)
            let value = i;
            for (let j = 0; j < 6; j++) {
                buffer[1 + j] = value & 0xff;
                value = Math.floor(value / 256);
            }
            buffer[7] = 0x00;
            buffer[8] = 0x00;
            return buffer;
        }
        else {
            throw new Error(`Integer too large: ${i}`);
        }
    }

    /**
     * Decode a variable length integer from a byte array into a number.
     * Reference: https://github.com/buidl-bitcoin/buidl-python/blob/d79e9808e8ca60975d315be41293cb40d968626d/buidl/helper.py#L160
     * @param b Bytes which contain the varint
     * @returns Decoded number
     */
    public static decode(b: Uint8Array): number {
        // Check for empty buffer
        if (b.byteLength === 0) {
            throw new Error('Empty buffer provided');
        }
        // Read first byte from the buffer
        const i = b[0];
        // Check if i is indicating its length
        if (i === 0xfd) {
            // 0xfd means the next two bytes are the number
            return readUInt16LE(b, 1);
        }
        else if (i === 0xfe) {
            // 0xfe means the next four bytes are the number
            return readUInt32LE(b, 1);
        }
        else if (i === 0xff) {
            // 0xff means the next eight bytes are the number, but Node JS can only read up to 6 bytes
            return readUIntLE(b, 1, 6);
        }
        else {
            // Anything else is just the integer
            return i;
        }
    }

}

function readUInt16LE(buffer: Uint8Array, offset: number): number {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    return view.getUint16(offset, true);
}

function readUInt32LE(buffer: Uint8Array, offset: number): number {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    return view.getUint32(offset, true);
}

function readUIntLE(buffer: Uint8Array, offset: number, length: number): number {
    let value = 0;
    let multiplier = 1;
    for (let i = 0; i < length; i++) {
        value += buffer[offset + i] * multiplier;
        multiplier *= 256;
    }
    return value;
}

export default VarInt;
