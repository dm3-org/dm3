import { sign } from 'dm3-lib-crypto';
import { GetChallenge, GetNewToken } from 'dm3-lib-delivery-api';
import { Connection } from '../web3provider/Web3Provider';

export async function reAuth(
    connection: Connection,
    getChallenge: GetChallenge,
    getNewToken: GetNewToken,
    privateSigningKey: string,
): Promise<string> {
    if (!connection.account) {
        throw Error('No account set');
    }

    if (!connection.provider) {
        throw Error('No provider');
    }

    const challenge = await getChallenge(
        connection.account,
        connection.provider,
    );
    const signature = await sign(privateSigningKey, challenge);

    return getNewToken(connection.account, connection.provider, signature);
}
