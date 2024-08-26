import {
    createStorageKey,
    decryptAsymmetric,
    encryptAsymmetric,
    EncryptedPayload,
    getStorageKeyCreationMessage,
} from '@dm3-org/dm3-lib-crypto';
import {
    createProfileKeys as _createProfileKeys,
    DEFAULT_NONCE,
    getProfileCreationMessage,
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
} from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import abiJson from '@erc725/smart-contracts/artifacts/ERC725.json';
import { ethers } from 'ethers';
import { Dm3KeyStore, IKeyStoreService } from './KeyStore/IKeyStore';
import { LuksoKeyStore } from './KeyStore/LuksoKeyStore';

export type LoginResult = {
    type: 'SUCCESS' | 'NEW_DEVICE';
    payload: any;
};

export class SmartAccountConnector {
    //The controller that signs on behalf of the UP. Managed by the UP extension
    private readonly upController: ethers.Signer;
    private readonly keyStoreService: IKeyStoreService;

    private readonly nonce;

    constructor(
        keyStoreService: IKeyStoreService,
        upController: ethers.Signer,
        nonce: string,
    ) {
        this.keyStoreService = keyStoreService;
        this.upController = upController;
        this.nonce = nonce;
    }
    //KeySync can be triggered by controller that has used dm3 before.
    //This function will normally be called after login on behalf of the user
    public async syncKeys(encryptionKeys: ProfileKeys) {
        //1. Get the current keyStore
        const keyStore = await this.keyStoreService.readDm3KeyStore();

        const encryptedControllerKeyStore =
            keyStore[await this.upController.getAddress()];

        //Should not happen because this function should only be called after login
        if (
            !encryptedControllerKeyStore ||
            !encryptedControllerKeyStore.encryptedProfileKeys
        ) {
            throw 'Controller has not used dm3 before';
        }

        //2. Decrypt the profileKeys of the controller

        const payload: EncryptedPayload = JSON.parse(
            atob(encryptedControllerKeyStore.encryptedProfileKeys),
        ) as EncryptedPayload;
        //Decrpyt the profileKeys of the controller
        const profileKeys = await decryptAsymmetric(
            encryptionKeys.encryptionKeyPair,
            payload,
            1,
        );

        //For each device in the keyStore, encrypt the profileKeys of the controller
        //That only applies for controllers that have a publicKey but not encryptedProfileKeys yet
        const newKeyStore: Dm3KeyStore = {};

        for (const key of Object.keys(keyStore)) {
            const controller = keyStore[key];

            // If the controller already has a profile we don't have to encrypt the profileKeys
            if (controller.encryptedProfileKeys) {
                newKeyStore[key] = controller;
                continue;
            }

            const encryptedProfileKeys = await encryptAsymmetric(
                controller.signerPublicKey,
                profileKeys,
                1,
            );

            newKeyStore[key] = {
                ...controller,
                encryptedProfileKeys: btoa(stringify(encryptedProfileKeys)),
            };
        }

        //3. Write the new keyStore
        await this.keyStoreService.writeDm3KeyStore(newKeyStore);
    }

    //Login is called by the client to start the login process without knowing the state of the keyStore.

    public async login(): Promise<LoginResult> {
        const keyStore = await this.keyStoreService.readDm3KeyStore();
        //Smart account has never used dm3 before
        if (Object.keys(keyStore).length === 0) {
            return await this.signUp();
        }
        const encryptedControllerKeyStore =
            keyStore[await this.upController.getAddress()];

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
    private async createProfileKeys() {
        //TODO replace with crytpo graphically secure random bytes
        const seed = ethers.utils.randomBytes(32).toString();

        const signature = await this.upController.signMessage(seed);
        const storageKey = await createStorageKey(signature);
        return await _createProfileKeys(storageKey, this.nonce);
    }

    //Returns Keys to encrypt the actual profile at UP
    private async createEncryptionKeys() {
        const controllerAddress = await this.upController.getAddress();

        const storageKeyCreationMessage = getStorageKeyCreationMessage(
            this.nonce,
            controllerAddress,
        );

        const signature = await this.upController.signMessage(
            storageKeyCreationMessage,
        );
        const storageKey = await createStorageKey(signature);
        return await _createProfileKeys(storageKey, this.nonce);
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

    // Device2 checks if a UserProfile has been published for this UP. It has.
    // Device2 checks if encrypted profileKeys for its deviceKeys are available locally or on an appropriate service.
    // They are not.
    // Device2 starts the key transfer process, by:
    // Storing Device2 public key on an appropriate service
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
