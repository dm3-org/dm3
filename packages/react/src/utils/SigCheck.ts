import * as Lib from 'dm3-lib';
import { stringify } from 'safe-stable-stringify';

export async function checkSignature(
    message: Lib.messaging.Message,
    publicSigningKey: string,
    accountAddress: string,
    signature: string,
): Promise<boolean> {
    const isValid = await Lib.crypto.checkSignature(
        publicSigningKey,
        stringify(message)!,
        signature,
    );

    if (!isValid) {
        Lib.log(`Signature check for ${accountAddress} failed.`);
    }

    if (
        Lib.external.formatAddress(accountAddress) !==
        Lib.external.formatAddress(message.from)
    ) {
        return false;
    } else {
        return isValid;
    }
}
