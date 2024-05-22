import { sign } from '@dm3-org/dm3-lib-crypto';
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
import { ConnectDsResult } from '../auth/DeliveryServiceConnector';
import { JwtInterceptor } from './JwtInterceptor';

//Interface to support different kinds of signers
export type SignMessageFn = (message: string) => Promise<string>;
//Facilitates either BE or DS
export abstract class ServerSideConnector extends JwtInterceptor {
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
        super(baseUrl);
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

    public async login(signedUserProfile: SignedUserProfile) {
        const isAlreadySignedUp = await this.profileExistsOnDeliveryService();
        //User has profile either onchain or at the resolver and has already sign up with the DS
        if (isAlreadySignedUp) {
            return await this.loginWithExistingProfile(signedUserProfile);
        }
        //  User has profile onchain but not interacted with the DS yet
        return await this.signUpWithExistingProfile(signedUserProfile);
    }
    protected override onReAuth(): Promise<string> {
        return this.reAuth();
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
        this.setAuthToken(data);
        return {
            deliveryServiceToken: data,
            signedUserProfile,
            profileKeys: this.profileKeys,
        };
    }

    private async loginWithExistingProfile(
        signedUserProfile: SignedUserProfile,
    ): Promise<ConnectDsResult> {
        const keys = this.profileKeys;
        const deliveryServiceToken = await this.reAuth();
        this.setAuthToken(deliveryServiceToken);

        return {
            profileKeys: keys,
            deliveryServiceToken,
            signedUserProfile,
        };
    }

    private async reAuth() {
        //TODO check if we need alias subdomain
        const url = `${this.baseUrl}/auth/${normalizeEnsName(this.ensName)}`;
        console.log('reauth', url);

        const { data } = await axios.get(url);

        const challenge = data.challenge;
        const signature = await sign(
            this.profileKeys.signingKeyPair.privateKey,
            challenge,
        );

        const getNewTokenUrl = `${this.baseUrl}/auth/${normalizeEnsName(
            this.ensName,
        )}`;
        //Todo move to lib
        const { data: getNewTokenData } = await axios.post(getNewTokenUrl, {
            signature,
        });

        return getNewTokenData.token;
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
