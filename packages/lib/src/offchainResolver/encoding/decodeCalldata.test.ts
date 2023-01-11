import { ethers } from 'ethers';
import { decodeCalldata } from './decodeCalldata';
import { getResolverInterface } from './getResolverInterface';
import { encodeEnsName } from '../dns/encodeEnsName';

describe('decodeCalldata', () => {
    it('decodes valid calldata', () => {
        const textData = getResolverInterface().encodeFunctionData('text', [
            ethers.utils.namehash(ethers.utils.nameprep('foo.dm3.eth')),
            'dm3.profile',
        ]);

        const calldata = getResolverInterface().encodeFunctionData('resolve', [
            encodeEnsName('foo.dm3.eth'),
            textData,
        ]);
        const { record, name, signature } = decodeCalldata(calldata);

        expect(record).toBe('dm3.profile');
        expect(name).toBe('foo.dm3.eth');
        expect(signature).toBe('text(bytes32,string)');
    });

    it('throws if namehash does not matched encoded ens.name', () => {
        const textData = getResolverInterface().encodeFunctionData('text', [
            ethers.utils.namehash(ethers.utils.nameprep('FOOO')),
            'dm3.profile',
        ]);

        const calldata = getResolverInterface().encodeFunctionData('resolve', [
            encodeEnsName('foo.dm3.eth'),
            textData,
        ]);

        expect(() => decodeCalldata(calldata)).toThrowError(
            "Namehash doesn't match",
        );
    });
});
