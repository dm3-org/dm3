import { PersonalSign } from '../external-apis/InjectedWeb3API';
import { load } from '../storage';
import { ConnectionState } from '../web3-provider';
import { Connection } from '../web3-provider/Web3Provider';
import { signInWithEthereum } from './signInWithEtheruem';

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
