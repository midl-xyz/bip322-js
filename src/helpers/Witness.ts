// Import dependencies
import VarInt from "./VarInt";
import VarStr from "./VarStr";
import BufferUtil from "./BufferUtil";

/**
 * Class that implement witness data serialization and deserialization.
 */
class Witness {

    /**
     * Encode array of witness into its base-64 encoded format.
     * Follows the encoding scheme found in buidl-python:
     *      https://github.com/buidl-bitcoin/buidl-python/blob/d79e9808e8ca60975d315be41293cb40d968626d/buidl/witness.py#L35
     * @param witnesses Array of witness data
     * @returns Base-64 encoded witness data
     */
    public static serialize(witnesses: Uint8Array[]): string {
        // The first element to be included is the length of the witness array as VarInt
        let witnessStack = VarInt.encode(witnesses.length);
        // Then, for each witness array,
        witnesses.forEach((witness) => {
            // Append each witness as a VarStr to the witness stack
            witnessStack = BufferUtil.concat(witnessStack, VarStr.encode(witness));
        });
        // Return the base-64 encoded witness stack
        return BufferUtil.toBase64(witnessStack);
    }

    /**
     * Decode encoded witness data, either as a base-64 encoded string or as a decoded string in a buffer, into an array of witness.
     * Follows the decoding scheme found in buidl-python:
     *      https://github.com/buidl-bitcoin/buidl-python/blob/d79e9808e8ca60975d315be41293cb40d968626d/buidl/witness.py#L62
     * @param encodedWitness Base-64 encoded witness data, or encoded witness data that have already been decoded
     * @returns Decoded witness data
     */
    public static deserialize(encodedWitness: string | Uint8Array): Uint8Array[] {
        // Store the decoded witness stack
        const witnessDecoded: Array<Uint8Array> = [];
        // Preprocess the encodedWitness if needed
        let witnessToDecode: Uint8Array;
        if (typeof encodedWitness === 'string') {
            // Decode the encoded witness if it is a string (assuming it is encoded using base-64)
            witnessToDecode = BufferUtil.fromBase64(encodedWitness);
        }
        else {
            witnessToDecode = encodedWitness;
        }
        // Read a VarInt which indicate the number of elements within the original witness array
        const witnessCount = VarInt.decode(witnessToDecode);
        // Slice the VarInt in front of the witness buffer before decoding each witness
        const varIntLength = VarInt.encode(witnessCount).byteLength;
        witnessToDecode = BufferUtil.ensureBuffer(witnessToDecode.subarray(varIntLength));
        // Loop for each witness encoded
        for (let i = 0; i < witnessCount; i++) {
            // Read a VarStr from the remaining buffer
            const witness = VarStr.decode(witnessToDecode);
            // Append the decoded witness to witnessDecoded
            witnessDecoded.push(witness);
            // Slice the read witness off witnessToDecode before next iteration
            const witnessLength = VarStr.encode(witness).byteLength;
            witnessToDecode = BufferUtil.ensureBuffer(witnessToDecode.subarray(witnessLength));
        }
        // Return deserialized witness data
        return witnessDecoded;
    }

}

export default Witness;
