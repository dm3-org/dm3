import { stringify } from '../shared/stringify';
import { UserProfile } from '../account';
import { SubmitUserProfile } from '../external-apis/BackendAPI';
import { PersonalSign } from '../external-apis/InjectedWeb3API';
import { UserDB, createDB } from '../storage';
import { ConnectionState } from '../web3-provider';
import { Connection } from '../web3-provider/Web3Provider';
import { signInWithEthereum } from './signInWithEtheruem';

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
