import { checkSignature as _checkSignature } from 'dm3-lib-crypto';
import { Message } from 'dm3-lib-messaging';
import { normalizeEnsName } from 'dm3-lib-profile';
import { log, stringify } from 'dm3-lib-shared';

export async function checkSignature(
    message: Message,
    publicSigningKey: string,
    ensName: string,
    signature: string,
): Promise<boolean> {
    const sigCheck = await _checkSignature(
        publicSigningKey,
        stringify(message)!,
        signature,
    );

    if (
        sigCheck &&
        normalizeEnsName(ensName) !== normalizeEnsName(message.metadata.from)
    ) {
        return true;
    } else {
        log(`Signature check for ${ensName} failed.`, 'error');
        return false;
    }
}
