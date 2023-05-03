import { ethersHelper, globalConfig, stringify } from 'dm3-lib-shared';
import { createKeyPairsFromSig } from '..';
import { signProfile } from './signProfile';
import { SubmitUserProfile } from 'dm3-lib-delivery-api';
import { UserDB, createDB } from 'dm3-lib-storage';
import {
    Account,
    ProfileKeys,
    SignedUserProfile,
    UserProfile,
} from 'dm3-lib-profile';
import { claimAddress } from 'dm3-lib-offchain-resolver-api';
import { Connection, ConnectionState } from '../../web3provider/Web3Provider';

const DEFAULT_NONCE = '0';

//Initial SignIn - Profile is unknown to the delivery service
//1 ->
//2 -> Sign newly created user profile. Use sign in with Etherum to create the signature to submit the user profile

//Reauth - Profile is known to the delivery service
//1 -> Use reAuth to create a new deliverySerivceToken. User has to sign a challenge
//2-> Decrypt storageFile.  Sign message with getMessage(nonce) to get the storage encryption key

export async function signIn(
    connection: Partial<Connection>,
    personalSign: ethersHelper.PersonalSign,
    submitUserProfile: SubmitUserProfile,
): Promise<{
    connectionState: ConnectionState;
    db: UserDB;
    deliveryServiceToken: string;
    account: Account;
}> {
    const [address] = await connection.provider!.listAccounts();

    const nonce = DEFAULT_NONCE;

    //Create new profileKey pair.
    const profileKeys = await createKeyPairsFromSig(
        connection as Connection,
        nonce,
    );

    const onChainProfile = getOnchainProfile(connection);

    const { profile, signature }: SignedUserProfile =
        onChainProfile ??
        (await createNewProfile(
            connection,
            personalSign,
            address,
            profileKeys,
        ));

    const signedUserProfile: SignedUserProfile = {
        profile,
        signature,
    };

    if (
        !(await claimAddress(
            address,
            process.env.REACT_APP_RESOLVER_BACKEND as string,
            signedUserProfile,
        ))
    ) {
        throw Error(`Couldn't claim address subdomain`);
    }

    const ensName = onChainProfile
        ? connection.account!.ensName
        : address + globalConfig.ADDR_ENS_SUBDOMAIN();

    //Submit newely created UserProfile
    const deliveryServiceToken = await submitUserProfile(
        { ensName, profile },
        connection.provider!,
        { profile, signature },
    );
    const account = {
        ensName,
        profile,
        profileSignature: signature,
    };

    return {
        connectionState: ConnectionState.SignedIn,
        db: {
            ...createDB(profileKeys),
        },
        deliveryServiceToken,
        account,
    };
}

function getOnchainProfile(
    connection: Partial<Connection>,
): SignedUserProfile | undefined {
    if (!connection.account?.profile || !connection.account?.profileSignature) {
        return undefined;
    }
    const { profile, profileSignature } = connection.account;
    return { profile, signature: profileSignature };
}
async function createNewProfile(
    connection: Partial<Connection>,
    personalSign: ethersHelper.PersonalSign,
    address: string,
    { signingKeyPair, encryptionKeyPair }: ProfileKeys,
): Promise<SignedUserProfile> {
    const profile: UserProfile = {
        publicSigningKey: signingKeyPair.publicKey,
        publicEncryptionKey: encryptionKeyPair.publicKey,
        deliveryServices: [globalConfig.DEFAULT_DELIVERY_SERVICE()],
    };

    //Create signed user profile
    const signature = await signProfile(
        connection.provider!,
        personalSign,
        address,
        stringify(profile),
    );

    return { profile, signature };
}
