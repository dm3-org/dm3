import { Envelop, EncryptionEnvelop } from "dm3-lib-messaging";
import { log } from "dm3-lib-shared";
import { Connection } from "../../src/web3provider/Web3Provider";

export async function sendMessage(
    connection: Connection,
    token: string,
    envelop: Envelop | EncryptionEnvelop,
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
                log(`- success`);
                onSuccess();
            } else {
                log(`- error`);
                onError();
            }
        },
    );
}
export type SendMessage = typeof sendMessage;
