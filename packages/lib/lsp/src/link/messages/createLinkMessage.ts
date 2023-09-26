import { sign } from 'dm3-lib-crypto';
import { stringify } from 'dm3-lib-shared';

export async function createLinkMessage(
    to: string,
    from: string,
    linkMessage: string,
    privateKey: string,
    signature: string,
): Promise<any> {
    const messgeWithoutSig = {
        message: '',
        attachments: [],
        metadata: {
            type: 'LSP_LINK',
            to,
            from,
            timestamp: new Date().getTime(),
            LSP: {
                privateKey,
                linkMessage,
                signature,
            },
        },
    };
    return {
        ...messgeWithoutSig,
        signature: await sign(privateKey, stringify(messgeWithoutSig)),
    };
}
