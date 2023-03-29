import { ethers } from 'ethers';
import { decodeRequest } from './decodeRequest';
import { getResolverInterface } from './getResolverInterface';
import { encodeEnsName } from '../dns/encodeEnsName';
import { PROFILE_RECORD_NAME } from 'dm3-lib-account';

describe('decodeRequest', () => {
    describe('decodeText', () => {
        it('decodes valid calldata', () => {
            const textData = getResolverInterface().encodeFunctionData('text', [
                ethers.utils.namehash('foo.dm3.eth'),
                PROFILE_RECORD_NAME,
            ]);

            const calldata = getResolverInterface().encodeFunctionData(
                'resolve',
                [encodeEnsName('foo.dm3.eth'), textData],
            );
            const { request } = decodeRequest(calldata);

            expect(request.record).toBe(PROFILE_RECORD_NAME);
            expect(request.name).toBe('foo.dm3.eth');
        });

        it('throws if namehash does not matched encoded ens.name', () => {
            const textData = getResolverInterface().encodeFunctionData('text', [
                ethers.utils.namehash('FOOO'),
                PROFILE_RECORD_NAME,
            ]);

            const calldata = getResolverInterface().encodeFunctionData(
                'resolve',
                [encodeEnsName('foo.dm3.eth'), textData],
            );

            expect(() => decodeRequest(calldata)).toThrowError(
                "Namehash doesn't match",
            );
        });
    });
    describe('decodeAddr', () => {
        it('decodes valid calldata', () => {
            const textData = getResolverInterface().encodeFunctionData('addr', [
                ethers.utils.namehash('foo.dm3.eth'),
            ]);

            const calldata = getResolverInterface().encodeFunctionData(
                'resolve',
                [encodeEnsName('foo.dm3.eth'), textData],
            );
            const { request } = decodeRequest(calldata);
            expect(request.name).toBe('foo.dm3.eth');
        });
        it('throws if namehash does not matched encoded ens.name', () => {
            const textData = getResolverInterface().encodeFunctionData('addr', [
                ethers.utils.namehash('FOOO'),
            ]);

            const calldata = getResolverInterface().encodeFunctionData(
                'resolve',
                [encodeEnsName('foo.dm3.eth'), textData],
            );

            expect(() => decodeRequest(calldata)).toThrowError(
                "Namehash doesn't match",
            );
        });
    });
});
