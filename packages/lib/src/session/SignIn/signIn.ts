import { Account, ProfileKeys, UserProfile } from '../../account';
import { SubmitUserProfile } from '../../external-apis/BackendAPI';
import { PersonalSign } from '../../external-apis/InjectedWeb3API';
import { stringify } from '../../shared/stringify';
import { createDB, UserDB } from '../../storage';
import { ConnectionState } from '../../web3-provider';
import { Connection } from '../../web3-provider/Web3Provider';
import { createKeyPairsFromSig } from './signProfileKeyPair';
import { signProfile as signProfile } from './signProfile';
import { claimAddress } from '../../external-apis';
import { SignedUserProfile } from '../../account/Account';
import { GlobalConf } from '../..';

const DEFAULT_NONCE = 0;

//Initial SignIn - Profile is unknown to the delivery service
//1 ->
//2 -> Sign newly created user profile. Use sign in with Etherum to create the signature to submit the user profile

//Reauth - Profile is known to the delivery service
//1 -> Use reAuth to create a new deliverySerivceToken. User has to sign a challenge
//2-> Decrypt storageFile.  Sign message with getMessage(nonce) to get the storage encryption key

const OFFCHAIN_RESOLVER_URL = 'http://localhost:8081/profile';

export async function signIn(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
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
        connection,
        personalSign,
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

    const successfullyClaimed = await claimAddress(
        address,
        OFFCHAIN_RESOLVER_URL,
        { profile, signature },
    );
    if (!successfullyClaimed) {
        throw Error(`Couldn't claim address subdomain`);
    }

    const ensName = onChainProfile
        ? connection.account!.ensName
        : address + GlobalConf.ADDR_ENS_SUBDOMAIN();

    //Submit newely created UserProfile
    const deliveryServiceToken = await submitUserProfile(
        { ensName, profile },
        connection as Connection,
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
    personalSign: PersonalSign,
    address: string,
    { signingKeyPair, encryptionKeyPair }: ProfileKeys,
): Promise<SignedUserProfile> {
    const profile: UserProfile = {
        publicSigningKey: signingKeyPair.publicKey,
        publicEncryptionKey: encryptionKeyPair.publicKey,
        deliveryServices: [GlobalConf.DEFAULT_DELIVERY_SERVICE()],
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
