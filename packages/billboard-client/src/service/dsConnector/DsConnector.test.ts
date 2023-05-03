import { ethers } from 'ethers';
import { IDatabase } from '../../persitance/getDatabase';
import { dsConnector } from './DsConnector';
import { mockUserProfile } from '../../../test/helper/mockUserProfile';
import { mockDeliveryServiceProfile } from '../../../test/helper/mockDeliveryServiceProfile';
import { UserProfile } from 'dm3-lib-profile';

describe('DsConnector', () => {
    describe('Establish connections', () => {
        let billboard1profile;
        let ds1Profile;
        beforeEach(async () => {
            billboard1profile = await mockUserProfile(
                ethers.Wallet.createRandom(),
                'billboard1.eth',
                ['ds1.eth'],
            );

            ds1Profile = await mockDeliveryServiceProfile(
                ethers.Wallet.createRandom(),
                'localhost:3001',
            );
        });

        it('Establish connections', async () => {
            const db = {} as IDatabase;
            const mockProvider = {
                resolveName: () => billboard1profile.address,
                getResolver: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return {
                            getText: () => billboard1profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds1.eth') {
                        return {
                            getText: () => ds1Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;
            const billBoards = [
                {
                    ensName: 'billboard1.eth',
                    privateKey: billboard1profile.privateKey,
                },
            ];

            await dsConnector(db, mockProvider, billBoards);
        });
        it('Throws if billboard has no profile', async () => {
            const db = {} as IDatabase;
            const mockProvider = {
                resolveName: () => billboard1profile.address,
                getResolver: (ensName: string) => {
                    if (ensName === 'billboard1.eth') {
                        return {
                            getText: () => undefined,
                        } as unknown as ethers.providers.Resolver;
                    }
                    if (ensName === 'ds1.eth') {
                        return {
                            getText: () => ds1Profile.stringified,
                        } as unknown as ethers.providers.Resolver;
                    }
                    throw new Error('mock provider unknown ensName');
                },
            } as unknown as ethers.providers.JsonRpcProvider;
            const billBoards = [
                {
                    ensName: 'billboard1.eth',
                    privateKey: billboard1profile.privateKey,
                },
            ];

            await expect(
                dsConnector(db, mockProvider, billBoards),
            ).rejects.toThrow(
                "Can't get billboard  profile for billboard1.eth",
            );
        });
    });
});
