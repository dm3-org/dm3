import * as Lib from 'dm3-lib';
import { createKeyPairsFromSig } from '..';
import { signProfile } from './signProfile';

const DEFAULT_NONCE = 0;

//Initial SignIn - Profile is unknown to the delivery service
//1 ->
//2 -> Sign newly created user profile. Use sign in with Etherum to create the signature to submit the user profile

//Reauth - Profile is known to the delivery service
//1 -> Use reAuth to create a new deliverySerivceToken. User has to sign a challenge
//2-> Decrypt storageFile.  Sign message with getMessage(nonce) to get the storage encryption key

export async function signIn(
    connection: Partial<Lib.Connection>,
    personalSign: Lib.shared.ethersHelper.PersonalSign,
    submitUserProfile: Lib.deliveryApi.SubmitUserProfile,
): Promise<{
    connectionState: Lib.web3provider.ConnectionState;
    db: Lib.storage.UserDB;
    deliveryServiceToken: string;
    account: Lib.account.Account;
}> {
    const [address] = await connection.provider!.listAccounts();

    const nonce = DEFAULT_NONCE;

    //Create new profileKey pair.
    const profileKeys = await createKeyPairsFromSig(
        connection as Lib.Connection,
        nonce,
    );

    const onChainProfile = getOnchainProfile(connection);

    const { profile, signature }: Lib.account.SignedUserProfile =
        onChainProfile ??
        (await createNewProfile(
            connection,
            personalSign,
            address,
            profileKeys,
        ));

    const signedUserProfile: Lib.account.SignedUserProfile = {
        profile,
        signature,
    };

    if (
        !(await Lib.offchainResolverApi.claimAddress(
            address,
            process.env.REACT_APP_RESOLVER_BACKEND as string,
            signedUserProfile,
        ))
    ) {
        throw Error(`Couldn't claim address subdomain`);
    }

    const ensName = onChainProfile
        ? connection.account!.ensName
        : address + Lib.GlobalConf.ADDR_ENS_SUBDOMAIN();

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
        connectionState: Lib.web3provider.ConnectionState.SignedIn,
        db: {
            ...Lib.storage.createDB(profileKeys),
        },
        deliveryServiceToken,
        account,
    };
}

function getOnchainProfile(
    connection: Partial<Lib.Connection>,
): Lib.account.SignedUserProfile | undefined {
    if (!connection.account?.profile || !connection.account?.profileSignature) {
        return undefined;
    }
    const { profile, profileSignature } = connection.account;
    return { profile, signature: profileSignature };
}
async function createNewProfile(
    connection: Partial<Lib.Connection>,
    personalSign: Lib.shared.ethersHelper.PersonalSign,
    address: string,
    { signingKeyPair, encryptionKeyPair }: Lib.account.ProfileKeys,
): Promise<Lib.account.SignedUserProfile> {
    const profile: Lib.account.UserProfile = {
        publicSigningKey: signingKeyPair.publicKey,
        publicEncryptionKey: encryptionKeyPair.publicKey,
        deliveryServices: [Lib.GlobalConf.DEFAULT_DELIVERY_SERVICE()],
    };

    //Create signed user profile
    const signature = await signProfile(
        connection.provider!,
        personalSign,
        address,
        Lib.shared.stringify(profile),
    );

    return { profile, signature };
}
