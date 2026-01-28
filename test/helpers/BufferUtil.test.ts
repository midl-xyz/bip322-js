// Import dependencies
import { expect } from 'chai';

// Import module to be tested
import { BufferUtil } from '../../src/helpers';

describe('BufferUtil.ensureBuffer', () => {

    it('Return the same Buffer instance if input is already a Buffer', () => {
        const buf = Buffer.from([1, 2, 3]);
        const result = BufferUtil.ensureBuffer(buf);
        expect(BufferUtil.equals(buf, result)).to.be.true;
    });
});
