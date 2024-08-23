import { SignedUserProfile, UserProfile } from '@dm3-org/dm3-lib-profile';
import { ethers } from 'ethers';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { Dm3KeyStore, IKeyStoreService as IKeyStore } from './IKeyStore';

const { toUtf8Bytes, keccak256 } = ethers.utils;

export const DM3_KEYSTORE_KEY = keccak256(toUtf8Bytes('network.dm3.keyStore'));
export const DM3_PROFILE_KEY = keccak256(toUtf8Bytes('network.dm3.profile'));

export class LuksoKeyStore implements IKeyStore {
    //A wrapper around the UP contract
    private readonly upContract: ethers.Contract;

    constructor(upContract: ethers.Contract) {
        this.upContract = upContract;
    }

    async writeDm3Profile(userProfile: SignedUserProfile): Promise<void> {
        await this.setData(DM3_PROFILE_KEY, userProfile);
    }
    async writeDm3KeyStore(keyStore: Dm3KeyStore): Promise<void> {
        await this.setData(DM3_KEYSTORE_KEY, keyStore);
    }
    async writeDm3KeyStoreAndUserProfile(
        keyStore: Dm3KeyStore,
        userProfile: SignedUserProfile,
    ): Promise<void> {
        const _valueBytesKeyStore = toUtf8Bytes(stringify(keyStore));
        const _valueBytesUserProfile = toUtf8Bytes(stringify(userProfile));
        await this.upContract.setDataBatch(
            [DM3_KEYSTORE_KEY, DM3_PROFILE_KEY],
            [_valueBytesKeyStore, _valueBytesUserProfile],
        );
    }
    async readDm3Profile(): Promise<SignedUserProfile | undefined> {
        const _valueBytes = await this.upContract.getData(DM3_PROFILE_KEY);
        if (!_valueBytes) {
            return undefined;
        }
        return JSON.parse(ethers.utils.toUtf8String(_valueBytes));
    }
    async readDm3KeyStore(): Promise<Dm3KeyStore | undefined> {
        const _valueBytes = await this.upContract.getData(DM3_KEYSTORE_KEY);
        if (!_valueBytes) {
            return undefined;
        }
        return JSON.parse(ethers.utils.toUtf8String(_valueBytes));
    }

    private async setData(k: string, v: SignedUserProfile | Dm3KeyStore) {
        const _valueBytes = ethers.utils.toUtf8Bytes(stringify(v));
        await this.upContract.setDataBatch([k], [_valueBytes]);
    }
}
