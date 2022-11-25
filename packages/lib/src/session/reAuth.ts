import { ethers } from 'ethers';
import { GetChallenge, GetNewToken } from '../external-apis/BackendAPI';
import { PersonalSign } from '../external-apis/InjectedWeb3API';
import { Connection } from '../web3-provider/Web3Provider';

export async function reAuth(
    connection: Connection,
    getChallenge: GetChallenge,
    getNewToken: GetNewToken,
    personalSign: PersonalSign,
): Promise<string> {
    if (!connection.account) {
        throw Error('No account set');
    }
    const provider = connection.provider as ethers.providers.JsonRpcProvider;
    const challenge = await getChallenge(connection.account, connection);
    const signature = await personalSign(
        provider,
        connection.account.address,
        challenge,
    );

    return getNewToken(connection.account, connection, signature);
}
