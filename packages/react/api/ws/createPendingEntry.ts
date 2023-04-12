import * as Lib from 'dm3-lib';

export async function createPendingEntry(
    connection: Lib.Connection,
    token: string,
    ensName: string,
    contactEnsName: string,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (connection.socket) {
        Lib.log(`Create pending entry`);
        connection.socket.emit(
            'pendingMessage',
            {
                ensName,
                contactEnsName,
                token,
            },
            (result: any) => {
                if (result.response === 'success') {
                    Lib.log(`- success`);
                    onSuccess();
                } else {
                    Lib.log(`- error`);
                    onError();
                }
            },
        );
    }
}
export type CreatePendingEntry = typeof createPendingEntry;
