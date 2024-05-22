import {
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
    getProfileCreationMessage,
    normalizeEnsName,
} from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import axios from 'axios';
import { ethers } from 'ethers';
import { claimAddress } from '../../adapters/offchainResolverApi';
import {
    getChallenge,
    getNewToken,
    submitUserProfile,
} from '@dm3-org/dm3-lib-delivery-api';
import { ConnectDsResult } from '../auth/DeliveryServiceConnector';
import { sign } from '@dm3-org/dm3-lib-crypto';

//Interface to support different kinds of signers
export type SignMessageFn = (message: string) => Promise<string>;
//Facilitates either BE or DS
export abstract class ServerSideConnector {
    private readonly mainnetProvider: ethers.providers.StaticJsonRpcProvider;
    private readonly signMessage: SignMessageFn;
    private readonly defaultDeliveryServiceEnsName: string;
    private readonly baseUrl: string;
    private readonly resolverBackendUrl: string;
    private readonly addrEnsSubdomain: string;
    private readonly ensName: string;
    private readonly address: string;
    private readonly profileKeys: ProfileKeys;

    constructor(
        mainnetProvider: ethers.providers.StaticJsonRpcProvider,
        signMessage: SignMessageFn,
        defaultDeliveryServiceEnsName: string,
        baseUrl: string,
        resolverBackendUrl: string,
        addrEnsSubdomain: string,
        ensName: string,
        address: string,
        profileKeys: ProfileKeys,
    ) {
        this.mainnetProvider = mainnetProvider;
        this.signMessage = signMessage;
        this.defaultDeliveryServiceEnsName = defaultDeliveryServiceEnsName;
        this.baseUrl = baseUrl;
        this.resolverBackendUrl = resolverBackendUrl;
        this.addrEnsSubdomain = addrEnsSubdomain;
        this.ensName = ensName;
        this.address = address;
        this.profileKeys = profileKeys;
    }

    public async login(signedUserProfile?: SignedUserProfile) {
        const userHasProfile = !!signedUserProfile;
        const isAlreadySignedUp = await this.profileExistsOnDeliveryService();

        const profileIsKnownToDs = userHasProfile && isAlreadySignedUp;

        //User has profile either onchain or at the resolver and has already sign up with the DS
        if (profileIsKnownToDs) {
            return await this.loginWithExistingProfile(
                this.ensName,
                signedUserProfile,
            );
        }
        //  User has profile onchain but not interacted with the DS yet
        if (userHasProfile) {
            return await this.signUpWithExistingProfile(signedUserProfile);
        }
        //User has neither an onchain profile nor a profile on the resolver
        return await this.createNewProfileAndLogin();
    }

    //TBD child can use this method to call a method from the DS
    protected async fetch() {
        //Make request to Server
        //If 401 then re-authenticate
        //and try again
    }

    private async createNewProfileAndLogin() {
        const createNewSignedUserProfile = async ({
            signingKeyPair,
            encryptionKeyPair,
        }: ProfileKeys) => {
            const profile: UserProfile = {
                publicSigningKey: signingKeyPair.publicKey,
                publicEncryptionKey: encryptionKeyPair.publicKey,
                deliveryServices: [this.defaultDeliveryServiceEnsName],
            };
            try {
                const profileCreationMessage = getProfileCreationMessage(
                    stringify(profile),
                    this.address,
                );
                const signature = await this.signMessage(
                    profileCreationMessage,
                );

                return {
                    profile,
                    signature,
                } as SignedUserProfile;
            } catch (error: any) {
                const err = error?.message.split(':');
                throw Error(err.length > 1 ? err[1] : err[0]);
            }
        };
        //sign a new profile that will be used to claim the address subdomain
        const signedUserProfile = await createNewSignedUserProfile(
            this.profileKeys,
        );

        return this.signUpWithExistingProfile(signedUserProfile);
    }

    private async signUpWithExistingProfile(
        signedUserProfile: SignedUserProfile,
    ): Promise<ConnectDsResult> {
        //TODO move claimAddress to useAuth
        if (
            !(await claimAddress(
                this.address,
                this.resolverBackendUrl as string,
                signedUserProfile,
            ))
        ) {
            throw Error(`Couldn't claim address subdomain`);
        }

        const ensName = this.address + this.addrEnsSubdomain;
        //Todo move api call to lib
        const url = `${this.baseUrl}/profile/${ensName}`;
        const { data } = await axios.post(url, signedUserProfile);
        return {
            deliveryServiceToken: data,
            signedUserProfile,
            profileKeys: this.profileKeys,
        };
    }

    private async loginWithExistingProfile(
        ensName: string,
        signedUserProfile: SignedUserProfile,
    ): Promise<ConnectDsResult> {
        const reAuth = async (
            ensName: string,
            profile: UserProfile,
            privateSigningKey: string,
        ) => {
            //Todo move to lib
            const url = `${this.baseUrl}/auth/${normalizeEnsName(ensName)}`;
            const { data } = await axios.get(url);

            const challenge = data.challenge;
            const signature = await sign(privateSigningKey, challenge);

            const getNewTokenUrl = `${this.baseUrl}/auth/${normalizeEnsName(
                ensName,
            )}`;
            //Todo move to lib
            const { data: getNewTokenData } = await axios.post(getNewTokenUrl, {
                signature,
            });

            return getNewTokenData.token;
        };
        const keys = this.profileKeys;
        const deliveryServiceToken = await reAuth(
            ensName,
            signedUserProfile.profile,
            keys.signingKeyPair.privateKey,
        );

        return {
            profileKeys: keys,
            deliveryServiceToken,
            signedUserProfile,
        };
    }

    private async profileExistsOnDeliveryService() {
        const path = `${this.baseUrl}/profile/${this.ensName}`;
        try {
            const { status } = await axios.get(path);
            return status === 200;
        } catch (err) {
            return false;
        }
    }
}
