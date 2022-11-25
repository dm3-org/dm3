import { ethers } from 'ethers';
import { ProfileKeys, UserProfile } from '../../account/Account';
import { createKeyPair, createSigningKeyPair } from '../../crypto';
import {
    GetChallenge,
    GetNewToken,
    SubmitUserProfile,
} from '../../external-apis/BackendAPI';
import { PersonalSign } from '../../external-apis/InjectedWeb3API';
import { stringify } from '../../shared/stringify';
import { createDB, load, UserDB } from '../../storage/Storage';
import { Connection, ConnectionState } from '../../web3-provider/Web3Provider';
import { signInWithEthereum } from './signInWithEtheruem';

export async function reAuth(
    connection: Connection,
    getChallenge: GetChallenge,
    getNewToken: GetNewToken,
    personalSign: PersonalSign,
): Promise<string> {
    if (!connection.account) {
        throw Error('No account set');
    }
    const provider = connection.provider as ethers.providers.JsonRpcProvider;
    const challenge = await getChallenge(connection.account, connection);
    const signature = await personalSign(
        provider,
        connection.account.address,
        challenge,
    );

    return getNewToken(connection.account, connection, signature);
}

export async function createKeys(
    nonceMsgSig: string,
    nonce: number,
): Promise<ProfileKeys> {
    return {
        encryptionKeyPair: await createKeyPair(nonceMsgSig),
        signingKeyPair: await createSigningKeyPair(nonceMsgSig),
        storageEncryptionKey: nonceMsgSig,
        storageEncryptionNonce: nonce,
    };
}

export async function initialSignIn(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    submitUserProfile: SubmitUserProfile,
): Promise<{
    connectionState: ConnectionState;
    db: UserDB;
    deliveryServiceToken: string;
}> {
    const { provider, account } = connection;
    const keys = await signInWithEthereum(
        provider!,
        personalSign,
        account?.address!,
    );

    //Initial Sign in -> Create new profile
    const profile: UserProfile = {
        publicSigningKey: keys.signingKeyPair.publicKey,
        publicEncryptionKey: keys.encryptionKeyPair.publicKey,
        deliveryServices: ['dev-ds.dm3.eth'],
    };

    //Create  signed user profile
    const signature = await personalSign(
        provider!,
        account?.address!,
        stringify(profile),
    );
    //Create userProfile
    const deliveryServiceToken = await submitUserProfile(
        { address: account?.address!, profile },
        connection as Connection,
        {
            profile,
            signature,
        },
    );

    return {
        connectionState: ConnectionState.SignedIn,
        db: {
            ...createDB(keys),
        },
        deliveryServiceToken,
    };
}

export async function getSessionFromStorage(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    storageFile: string,
) {
    const { provider, account } = connection;

    const keys = await signInWithEthereum(
        provider!,
        personalSign,
        account?.address!,
    );

    const externalData = await load(
        JSON.parse(storageFile),
        keys.storageEncryptionKey,
    );

    return {
        connectionState: ConnectionState.SignedIn,
        db: {
            ...externalData,
        },
    };
}

export function getSessionToken(signature: string) {
    return ethers.utils.keccak256(signature);
}

//"309ac781-fef0-4a31-a3cb-b31a42af6566"
