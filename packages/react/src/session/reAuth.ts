import * as Lib from 'dm3-lib';

export async function reAuth(
    connection: Lib.Connection,
    getChallenge: Lib.deliveryApi.GetChallenge,
    getNewToken: Lib.deliveryApi.GetNewToken,
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
    const signature = await Lib.crypto.sign(privateSigningKey, challenge);

    return getNewToken(connection.account, connection.provider, signature);
}
