import { sign } from 'dm3-lib-crypto';
import { stringify } from 'dm3-lib-shared';

export async function createLinkRecoverMessage(
    to: string,
    from: string,
    sign: (msg: string) => Promise<string>,
): Promise<any> {
    const messgeWithoutSig = {
        message: '',
        attachments: [],
        metadata: {
            type: 'LSP_RECOVER',
            to,
            from,
            timestamp: new Date().getTime(),
        },
    };
    return {
        ...messgeWithoutSig,
        signature: await sign(stringify(messgeWithoutSig)),
    };
}
