import { EncryptionEnvelop, Envelop } from '@dm3-org/dm3-lib-messaging';
import { Socket } from 'socket.io-client';

/**
 * send a message using the web socket API
 * @param socket The socket.io web socket to use
 * @param token The auth token
 * @param envelop The envelop containing the acutal message
 * @param onSuccess Callback in case of success
 * @param onError Callback in case that an error occured
 */
export async function sendMessage(
    socket: Socket,
    token: string,
    envelop: Envelop | EncryptionEnvelop,
    onSuccess: () => void,
    onError: () => void,
): Promise<void> {
    socket.emit(
        'submitMessage',
        {
            envelop,
            token,
        },
        (result: any) => {
            if (result.response === 'success') {
                onSuccess();
            } else {
                onError();
            }
        },
    );
}
export type SendMessage = typeof sendMessage;
