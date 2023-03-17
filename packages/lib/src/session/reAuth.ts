import { sign } from '../crypto/src';
import { GetChallenge, GetNewToken } from '../external-apis/BackendAPI';
import { Connection } from '../web3-provider/Web3Provider';

export async function reAuth(
    connection: Connection,
    getChallenge: GetChallenge,
    getNewToken: GetNewToken,
    privateSigningKey: string,
): Promise<string> {
    if (!connection.account) {
        throw Error('No account set');
    }

    const challenge = await getChallenge(connection.account, connection);
    const signature = await sign(privateSigningKey, challenge);

    return getNewToken(connection.account, connection, signature);
}
