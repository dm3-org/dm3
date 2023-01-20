import * as Lib from 'dm3-lib';
import { stringify } from 'safe-stable-stringify';

export async function checkSignature(
    message: Lib.messaging.Message,
    publicSigningKey: string,
    ensName: string,
    signature: string,
): Promise<boolean> {
    const sigCheck = await Lib.crypto.checkSignature(
        publicSigningKey,
        stringify(message)!,
        signature,
    );

    if (
        sigCheck &&
        Lib.account.normalizeEnsName(ensName) !==
            Lib.account.normalizeEnsName(message.metadata.from)
    ) {
        return true;
    } else {
        Lib.log(`Signature check for ${ensName} failed.`);
        return false;
    }
}
