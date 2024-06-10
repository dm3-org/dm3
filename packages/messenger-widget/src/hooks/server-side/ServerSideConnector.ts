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
import { JwtInterceptor } from './JwtInterceptor';
import { JwtPayload, decode } from 'jsonwebtoken';

//Interface to support different kinds of signers
export type SignMessageFn = (message: string) => Promise<string>;
//Facilitates either BE or DS
export abstract class ServerSideConnector extends JwtInterceptor {
    private readonly baseUrl: string;
    private readonly resolverBackendUrl: string;
    private readonly address: string;
    private readonly profileKeys: ProfileKeys;

    constructor(
        baseUrl: string,
        resolverBackendUrl: string,
        addrEnsSubdomain: string,
        address: string,
        profileKeys: ProfileKeys,
        //Websocket is disabled per default as not every connector needs a WS connection
        enableWebsocket: boolean = false,
    ) {
        super(
            baseUrl,
            normalizeEnsName(address + addrEnsSubdomain),
            enableWebsocket,
        );

        this.baseUrl = baseUrl;
        this.resolverBackendUrl = resolverBackendUrl;
        this.address = address;
        this.profileKeys = profileKeys;
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

    private async _signUp(signedUserProfile: SignedUserProfile) {
        //TODO move claimAddress to useAuth
        await claimAddress(
            this.address,
            this.resolverBackendUrl as string,
            signedUserProfile,
        );

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

    private async _login(signedUserProfile: SignedUserProfile) {
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

        const { data: challenge } = await axios.get(url);

        const signature = await sign(
            this.profileKeys.signingKeyPair.privateKey,
            challenge,
        );

        //Todo move to lib
        const { data: newToken } = await axios.post(url, {
            signature,
            challenge,
        });

        return newToken;
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
