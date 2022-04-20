import { signWithSignatureKey } from '../encryption/Encryption';
import { Connection } from '../web3-provider/Web3Provider';
import { UserDB } from '../storage/Storage';
import { log } from '../shared/log';
import { Keys } from '../account/Account';

export interface PublicMessage {
    from: string;
    timestamp: number;
    message: string;
    previousMessageUri: string | null;
}

export interface PublicEnvelop {
    message: PublicMessage;
    signature: string;
    id?: string;
}

export async function createMessage(
    messageText: string,
    connection: Connection,
    userDb: UserDB,
    getHead: (accountAddress: string) => Promise<string>,
    getTimestamp: () => number,
): Promise<PublicEnvelop> {
    log('Create public message');

    if (!connection.account) {
        throw Error('No account');
    }
    const message = {
        from: connection.account.address,
        timestamp: getTimestamp(),
        message: messageText,
        previousMessageUri: await getHead(connection.account.address),
    };

    return {
        message,
        signature: signWithSignatureKey(message, userDb?.keys as Keys),
    };
}
