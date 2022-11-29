import { PersonalSign } from '../external-apis/InjectedWeb3API';
import { load } from '../storage';
import { ConnectionState } from '../web3-provider';
import { Connection } from '../web3-provider/Web3Provider';
import { signProfileKeyPair } from './SignIn/signProfileKeyPair';

const DEFAULT_NONCE = 0;

export async function getSessionFromStorage(
    connection: Partial<Connection>,
    personalSign: PersonalSign,
    storageFile: string,
    nonce: number = DEFAULT_NONCE,
) {
    const keys = await signProfileKeyPair(connection!, personalSign, nonce);

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
