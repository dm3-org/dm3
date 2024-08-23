import {
    createStorageKey,
    decrypt,
    decryptAsymmetric,
    encrypt,
    encryptAsymmetric,
    EncryptedPayload,
    getStorageKeyCreationMessage,
} from '@dm3-org/dm3-lib-crypto';
import {
    createProfileKeys as _createProfileKeys,
    getProfileCreationMessage,
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
} from '@dm3-org/dm3-lib-profile';
import { sha256, stringify } from '@dm3-org/dm3-lib-shared';
import abiJson from '@erc725/smart-contracts/artifacts/ERC725.json';
import { ethers } from 'ethers';
import { Dm3KeyStore, IKeyStoreService } from './KeyStore/IKeyStore';
import { LuksoKeyStore } from './KeyStore/LuksoKeyStore';
import { Key } from 'react';

export type LoginResult = {
    type: 'SUCCESS' | 'NEW_DEVICE';
    payload: any;
};

export class SmartAccountConnector {
    //The controller that signs on behalf of the UP. Managed by the UP extension
    private readonly upController: ethers.Signer;
    private readonly keyStoreService: IKeyStoreService;

    constructor(
        keyStoreService: IKeyStoreService,
        upController: ethers.Signer,
    ) {
        this.keyStoreService = keyStoreService;
        this.upController = upController;
    }

    //TODO move to class tailored to lukso
    public static async _instance(): Promise<SmartAccountConnector> {
        //The universal profile extension can be accessed via the window.lukso object
        if (!window.lukso) {
            throw 'Universal Profile extension not found';
        }
        const provider = new ethers.providers.Web3Provider(window.lukso);
        //Connect with the UP extension
        await provider.send('eth_requestAccounts', []);

        //The signer that will be used to sign transactions
        const upController = await provider.getSigner();
        //When uses with UP the signer.getAddress() will return the UP address. Even though the signer uses the controller address to sign transactions
        //TODO clearify with Lukso-Team if that is always the case
        const upAddress = await upController.getAddress();

        //Instance of the UP contract
        const upContract = new ethers.Contract(
            upAddress,
            abiJson.abi,
            upController,
        );

        const kss = new LuksoKeyStore(upContract);

        return new SmartAccountConnector(kss, upController);
    }

    private async createProfileKeys() {
        //TEST_NONCE replcae with nonce from the app
        const nonce = '0x0123';
        //TODO replace with crytpo graphically secure random bytes
        const seed = ethers.utils.randomBytes(32).toString();

        const signature = await this.upController.signMessage(seed);
        const storageKey = await createStorageKey(signature);
        return await _createProfileKeys(storageKey, nonce);
    }

    //Returns Keys to encrypt the actual profile at UP
    private async createEncryptionKeys() {
        //TEST_NONCE replcae with nonce from the app
        const nonce = '0x0123';

        const controllerAddress = await this.upController.getAddress();

        const storageKeyCreationMessage = getStorageKeyCreationMessage(
            nonce,
            controllerAddress,
        );

        const signature = await this.upController.signMessage(
            storageKeyCreationMessage,
        );
        const storageKey = await createStorageKey(signature);
        return await _createProfileKeys(storageKey, nonce);
    }

    private async createNewSignedUserProfile(
        { signingKeyPair, encryptionKeyPair }: ProfileKeys,
        defaultDeliveryService: string,
        upAddress: string,
    ) {
        const profile: UserProfile = {
            publicSigningKey: signingKeyPair.publicKey,
            publicEncryptionKey: encryptionKeyPair.publicKey,
            deliveryServices: [defaultDeliveryService],
        };

        const profileCreationMessage = getProfileCreationMessage(
            stringify(profile),
            upAddress,
        );
        const signature = await this.upController.signMessage(
            profileCreationMessage,
        );

        return {
            profile,
            signature,
        } as SignedUserProfile;
    }

    public keySync() {}

    public async login(): Promise<LoginResult> {
        const keyStore = await this.keyStoreService.readDm3KeyStore();
        //Smart account has never used dm3 before
        if (!keyStore) {
            return await this.signUp();
        }
        const encryptedControllerKeyStore =
            keyStore![await this.upController.getAddress()];

        //If the controller already has a keyStore, we can decrypt the profileKeys using its encryptionKeys
        //If not we've to start the keyExchange process
        if (
            !encryptedControllerKeyStore ||
            !encryptedControllerKeyStore.encryptedProfileKeys
        ) {
            //The signer connected to the UP has not  used dm3 before, it has to publish its public key so another device can share the profile keys
            return await this.addNewSigner(keyStore);
        }
        //The signer connected to the UP has already used dm3 before, hence it knows the profile
        return await this.signInExistingSigner(
            encryptedControllerKeyStore.encryptedProfileKeys,
        );
    }

    private async signInExistingSigner(encryptedProfileKeys: string) {
        const encryptionKeys = await this.createEncryptionKeys();
        const payload: EncryptedPayload = JSON.parse(
            atob(encryptedProfileKeys),
        ) as EncryptedPayload;

        const profileKeys = await decryptAsymmetric(
            encryptionKeys?.encryptionKeyPair!,
            payload,
            1,
        );

        return {
            type: 'SUCCESS',
            payload: JSON.parse(profileKeys) as ProfileKeys,
        } as LoginResult;
    }
    private async addNewSigner(keyStore: Dm3KeyStore) {
        const encryptionKeys = await this.createEncryptionKeys();

        //The controller has to publish its publicKey to the UP so any other device can share the profile keys with it
        const newKeyStore = {
            ...keyStore,
            [await this.upController.getAddress()]: {
                signerPublicKey: encryptionKeys.encryptionKeyPair.publicKey,
            },
        };

        await this.keyStoreService.writeDm3KeyStore(newKeyStore);
        //Indicate that a new device has been added. The user has to go back to device 1 to share the profile keys
        return {
            type: 'NEW_DEVICE',
            //Eventually the client would tell the user the addresses of the other devices.
            payload: Object.keys(keyStore ?? {}),
        } as LoginResult;
    }

    //Creates a session for a smart account that has never used dm3 before
    // 1. Device1 creates profileKeys from random seed
    // 2. UP publishes Dm3-UserProfile based on profileKeys created in #1 to UP KV (key value) store
    // 3. Device uploads encrypted profileKeys to KV store
    private async signUp() {
        //TODO replace with the address of the UP contract
        const deliveryService = 'ds.eth';
        const upContollerAddress = await this.upController.getAddress();

        const profileKeys = await this.createProfileKeys();
        const encryptionKeys = await this.createEncryptionKeys();

        const encryptedPayload: EncryptedPayload = await encryptAsymmetric(
            encryptionKeys?.encryptionKeyPair?.publicKey!,
            stringify(profileKeys),
            1,
        );
        const encryptedProfileKeys = btoa(stringify(encryptedPayload));

        const dm3KeyStore: Dm3KeyStore = {
            [upContollerAddress]: {
                encryptedProfileKeys,
                signerPublicKey: profileKeys.encryptionKeyPair.publicKey,
            },
        };

        const userProfile = await this.createNewSignedUserProfile(
            profileKeys,
            deliveryService,
            upContollerAddress,
        );
        await this.keyStoreService.writeDm3KeyStoreAndUserProfile(
            dm3KeyStore,
            userProfile,
        );

        return {
            type: 'SUCCESS',
            payload: profileKeys,
        } as LoginResult;
    }
}
