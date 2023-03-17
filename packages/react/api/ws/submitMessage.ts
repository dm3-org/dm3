import * as Lib from 'dm3-lib';

export async function sendMessage(
    connection: Lib.Connection,
    token: string,
    envelop: Lib.messaging.Envelop | Lib.messaging.EncryptionEnvelop,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    if (!connection.socket) {
        return;
    }
    connection.socket.emit(
        'submitMessage',
        {
            envelop,
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
export type SendMessage = typeof sendMessage;
