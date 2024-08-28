import { SignedUserProfile } from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import { ethers } from 'ethers';
import {
    Dm3KeyStore,
    IKeyStoreService as IKeyStore,
} from '../KeyStore/IKeyStore';
import { DM3_KEYSTORE_KEY, DM3_PROFILE_KEY } from '../KeyStore/constants';

const { toUtf8Bytes } = ethers.utils;

export class LuksoKeyStore implements IKeyStore {
    //A wrapper around the UP contract
    private readonly upContract: ethers.Contract;

    constructor(upContract: ethers.Contract) {
        this.upContract = upContract;
    }
    getAccountAddress(): string {
        return this.upContract.address;
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
        const _valueBytesKeyStore = ethers.utils.toUtf8Bytes(
            stringify(keyStore),
        );
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
    async readDm3KeyStore(): Promise<Dm3KeyStore> {
        const _valueBytes = await this.upContract.getData(DM3_KEYSTORE_KEY);
        if (!_valueBytes || _valueBytes === '0x') {
            return {};
        }
        return JSON.parse(ethers.utils.toUtf8String(_valueBytes));
    }

    private async setData(k: string, v: SignedUserProfile | Dm3KeyStore) {
        const _valueBytes = ethers.utils.toUtf8Bytes(stringify(v));
        await this.upContract.setDataBatch([k], [_valueBytes]);
    }
}
