import { log } from 'dm3-lib-shared';
import { Connection } from '../../src/web3provider/Web3Provider';

export async function createPendingEntry(
    connection: Connection,
    token: string,
    ensName: string,
    contactEnsName: string,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (connection.socket) {
        log(`Create pending entry`);
        connection.socket.emit(
            'pendingMessage',
            {
                ensName,
                contactEnsName,
                token,
            },
            (result: any) => {
                if (result.response === 'success') {
                    log(`- success`);
                    onSuccess();
                } else {
                    log(`- error`);
                    onError();
                }
            },
        );
    }
}
export type CreatePendingEntry = typeof createPendingEntry;
