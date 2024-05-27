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
    private readonly baseUrl: string;
    private readonly resolverBackendUrl: string;
    private readonly ensName: string;
    private readonly address: string;
    private readonly profileKeys: ProfileKeys;

    constructor(
        baseUrl: string,
        resolverBackendUrl: string,
        addrEnsSubdomain: string,
        address: string,
        profileKeys: ProfileKeys,
    ) {
        super(baseUrl);

        this.baseUrl = baseUrl;
        this.resolverBackendUrl = resolverBackendUrl;
        this.address = address;
        this.profileKeys = profileKeys;

        this.ensName = normalizeEnsName(this.address + addrEnsSubdomain);
    }

    public async login(signedUserProfile: SignedUserProfile) {
        const isAlreadySignedUp = await this.profileExistsOnDeliveryService();
        //User has profile either onchain or at the resolver and has already sign up with the DS
        if (isAlreadySignedUp) {
            return await this._login(signedUserProfile);
        }
        //  User has profile onchain but not interacted with the DS yet
        return await this._signUp(signedUserProfile);
    }
    protected override onReAuth(): Promise<string> {
        return this.reAuth();
    }

    private async _signUp(
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
        const deliveryServiceToken = await this.submitUserProfile(
            signedUserProfile,
        );
        this.setAuthToken(deliveryServiceToken);
        return {
            deliveryServiceToken,
            signedUserProfile,
            profileKeys: this.profileKeys,
        };
    }

    private async _login(
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

    private async submitUserProfile(signedUserProfile: SignedUserProfile) {
        const url = `${this.baseUrl}/profile/${this.ensName}`;
        const { data } = await axios.post(url, signedUserProfile);
        return data;
    }
}
