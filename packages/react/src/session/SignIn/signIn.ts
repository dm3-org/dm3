import * as Lib from 'dm3-lib';
import { signProfile } from './signProfile';
import { createKeyPairsFromSig } from './signProfileKeyPair';

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
    account: Lib.profile.Account;
}> {
    const [address] = await connection.provider!.listAccounts();

    const nonce = DEFAULT_NONCE;

    //Create new profileKey pair.
    const profileKeys = await createKeyPairsFromSig(
        connection as Lib.Connection,
        Lib.shared.ethersHelper.prersonalSign,
        nonce,
    );

    const onChainProfile = getOnchainProfile(connection);

    const { profile, signature }: Lib.profile.SignedUserProfile =
        onChainProfile ??
        (await createNewProfile(
            connection,
            personalSign,
            address,
            profileKeys,
        ));

    const signedUserProfile: Lib.profile.SignedUserProfile = {
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
): Lib.profile.SignedUserProfile | undefined {
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
    { signingKeyPair, encryptionKeyPair }: Lib.profile.ProfileKeys,
): Promise<Lib.profile.SignedUserProfile> {
    const profile: Lib.profile.UserProfile = {
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
