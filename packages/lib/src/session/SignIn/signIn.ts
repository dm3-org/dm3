import { UserProfile } from '../../account';
import { SubmitUserProfile } from '../../external-apis/BackendAPI';
import { PersonalSign } from '../../external-apis/InjectedWeb3API';
import { stringify } from '../../shared/stringify';
import { createDB, UserDB } from '../../storage';
import { ConnectionState } from '../../web3-provider';
import { Connection } from '../../web3-provider/Web3Provider';
import { createKeyPairsFromSig } from './signProfileKeyPair';
import { signProfile as signProfile } from './signProfile';

const DEFAULT_NONCE = 0;

//Initial SignIn - Profile is unknown to the delivery service
//1 ->
//2 -> Sign newly created user profile. Use sign in with Etherum to create the signature to submit the user profile

//Reauth - Profile is known to the delivery service
//1 -> Use reAuth to create a new deliverySerivceToken. User has to sign a challenge
//2-> Decrypt storageFile.  Sign message with getMessage(nonce) to get the storage encryption key

export async function signIn(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    submitUserProfile: SubmitUserProfile,
): Promise<{
    connectionState: ConnectionState;
    db: UserDB;
    deliveryServiceToken: string;
}> {
    const { provider, account } = connection;

    const nonce = DEFAULT_NONCE;

    //Create new profileKey pair.
    const profileKeys = await createKeyPairsFromSig(
        connection,
        personalSign,
        nonce,
    );
    const { signingKeyPair, encryptionKeyPair } = profileKeys;

    const profile: UserProfile = {
        publicSigningKey: signingKeyPair.publicKey,
        publicEncryptionKey: encryptionKeyPair.publicKey,
        deliveryServices: ['dev-ds.bnb'],
    };

    //Create signed user profile
    const signature = await signProfile(
        provider!,
        personalSign,
        account?.address!,
        stringify(profile),
    );

    //Submit newely created UserProfile
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
            ...createDB(profileKeys),
        },
        deliveryServiceToken,
    };
}
