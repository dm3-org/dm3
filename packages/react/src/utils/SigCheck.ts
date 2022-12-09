import * as Lib from 'dm3-lib';
import { stringify } from 'safe-stable-stringify';

export async function checkSignature(
    message: Lib.messaging.Message,
    publicSigningKey: string,
    accountAddress: string,
    signature: string,
): Promise<boolean> {
    const sigCheck = await Lib.crypto.checkSignature(
        publicSigningKey,
        stringify(message)!,
        signature,
    );

    if (
        sigCheck &&
        Lib.external.formatAddress(accountAddress) !==
            Lib.external.formatAddress(message.metadata.from)
    ) {
        return true;
    } else {
        Lib.log(`Signature check for ${accountAddress} failed.`);
        return false;
    }
}
