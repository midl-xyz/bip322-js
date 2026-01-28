// Import dependency
import { expect } from 'chai';

// Import test data
import { readFileSync } from 'node:fs';
import path from 'node:path';

type ScriptSignatureFixture = {
    valid: Array<{ hex: string; raw: { r: string; s: string }; hashType: number }>;
    invalid: Array<{ hex: string; exception: string }>;
};

const fixtures = JSON.parse(
    readFileSync(path.join(__dirname, 'signature.json'), 'utf8')
) as ScriptSignatureFixture;

// Import module to be tested
import { decodeScriptSignature } from '../../src/bitcoinjs';

// Test copied from https://github.com/bitcoinjs/bitcoinjs-lib/blob/5d2ff1c61165932e2814d5f37630e6720168561c/test/script_signature.spec.ts
describe('Decode Script Signatures', () => {

    function fromRaw(signature: { r: string; s: string }): Buffer {
        return Buffer.concat(
            [Buffer.from(signature.r, 'hex'), Buffer.from(signature.s, 'hex')],
            64
        );
    }

    function toRaw(signature: Uint8Array): {
        r: string;
        s: string;
    } {
        return {
            r: Buffer.from(signature.slice(0, 32)).toString('hex'),
            s: Buffer.from(signature.slice(32, 64)).toString('hex')
        };
    }

    fixtures.valid.forEach(f => {
        it('Decodes ' + f.hex, () => {
            const decode = decodeScriptSignature(Buffer.from(f.hex, 'hex'));
            expect(toRaw(decode.signature)).to.deep.equal(f.raw);
            expect(decode.hashType).to.equal(f.hashType);
        });
    });

    fixtures.invalid.forEach(f => {
        it('Throws on ' + f.hex, () => {
            const buffer = Buffer.from(f.hex, 'hex');
            expect(decodeScriptSignature.bind(decodeScriptSignature, buffer)).to.throws(new RegExp(f.exception));
        });
    });

});
