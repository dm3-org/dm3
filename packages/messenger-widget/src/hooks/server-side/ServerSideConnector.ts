import {
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
    getProfileCreationMessage,
} from '@dm3-org/dm3-lib-profile';
import { stringify } from '@dm3-org/dm3-lib-shared';
import axios from 'axios';
import { ethers } from 'ethers';
import { claimAddress } from '../../adapters/offchainResolverApi';
import { submitUserProfile } from '@dm3-org/dm3-lib-delivery-api';

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
        // if (profileIsKnownToDs) {
        //     return await loginWithExistingProfile(
        //         this.ensName,
        //         signedUserProfile,
        //     );
        // }
        // //User has profile onchain but not interacted with the DS yet
        // if (userHasProfile) {
        //     return await signUpWithExistingProfile(
        //         this.ensName,
        //         signedUserProfile,
        //     );
        // }
        //User has neither an onchain profile nor a profile on the resolver
        return await this.createNewProfileAndLogin();
    }

    //TBD child can use this method to call a method from the DS
    protected async fetch() {}

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
        const keys = this.profileKeys;

        const signedUserProfile = await createNewSignedUserProfile(keys);
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
        const url = `${this.baseUrl}/profile/${ensName}`;
        // const deliveryServiceToken = await submitUserProfile(
        //     this.baseUrl,
        //     { ensName, profile: signedUserProfile.profile },
        //     signedUserProfile,
        // );

        console.log('url', url);

        const { data } = await axios.post(url, signedUserProfile);
        console.log(data);
        return {
            deliveryServiceToken: data,
            signedUserProfile,
            profileKeys: keys,
        };
    }

    private async profileExistsOnDeliveryService() {
        //TODO move default url to global config (Alex)
        // Tested by changing it to global config, but there is some error from backend (Bhupesh)
        const path = `${this.baseUrl}/profile/${this.ensName}`;
        try {
            const { status } = await axios.get(path);
            return status === 200;
        } catch (err) {
            return false;
        }
    }
}
