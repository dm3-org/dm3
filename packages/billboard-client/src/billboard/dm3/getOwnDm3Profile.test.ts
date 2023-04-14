import ethers from 'ethers';
import { getOwnDm3Profile } from './getOwnDm3Profile';
describe('Get Onw Dm3 Profile', () => {
    it('throws if process.env.ensName is undefined', async () => {
        const mockProvider = {} as ethers.providers.BaseProvider;
        await expect(getOwnDm3Profile(mockProvider)).rejects.toThrow(
            'ENS name is undefined',
        );
    });
    it('throws if provided ens name has no dm3 profile', async () => {
        const mockProvider = {
            getResolver: jest.fn().mockResolvedValue(undefined) as unknown,
        } as ethers.providers.BaseProvider;

        process.env.ensName = 'alice.eth';
        await expect(getOwnDm3Profile(mockProvider)).rejects.toThrow(
            'no dm3 profile found for alice.eth. Ensure that the textRecord dm3.profile contains a valid dm3Profile',
        );
    });
});
