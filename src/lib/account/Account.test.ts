import { ethers } from 'ethers';
import {
    checkProfileRegistryEntry,
    getAccountDisplayName,
    ProfileRegistryEntry,
} from './Account';

test('get correct account display name', async () => {
    const ensNames = new Map();
    ensNames.set('0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855', 'test1');
    expect(
        getAccountDisplayName(
            '0xDd36ae7F9a8E34FACf1e110c6e9d37D0dc917855',
            ensNames,
        ),
    ).toStrictEqual('test1');

    expect(
        getAccountDisplayName(
            '0x25A643B6e52864d0eD816F1E43c0CF49C83B8292',
            ensNames,
        ),
    ).toStrictEqual('0x25...8292');
});

test('checkProfileRegistryEntry should accept a correct signature ', async () => {
    const profileRegistryEntry: ProfileRegistryEntry = {
        publicKeys: {
            publicKey: '1',
            publicMessagingKey: '2',
            publicSigningKey: '3',
        },
    };

    const wallet = ethers.Wallet.createRandom();
    const sig = await wallet.signMessage(JSON.stringify(profileRegistryEntry));

    expect(
        checkProfileRegistryEntry(profileRegistryEntry, sig, wallet.address),
    ).toStrictEqual(true);
});

test('checkProfileRegistryEntry should reject an invalid signature ', async () => {
    const profileRegistryEntry: ProfileRegistryEntry = {
        publicKeys: {
            publicKey: '1',
            publicMessagingKey: '2',
            publicSigningKey: '3',
        },
    };

    const wallet = ethers.Wallet.createRandom();
    const sig = await wallet.signMessage(
        JSON.stringify({
            publicKeys: { ...profileRegistryEntry.publicKeys, publicKey: '4' },
        }),
    );

    expect(
        checkProfileRegistryEntry(profileRegistryEntry, sig, wallet.address),
    ).toStrictEqual(false);
});
