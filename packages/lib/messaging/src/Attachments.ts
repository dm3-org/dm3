import { logError, logWarning } from '@dm3-org/dm3-lib-shared';
import { Envelop } from './Envelop';

const SUPPORTED_PROTOCOLS = ['http', 'https', 'data'];

function uriCheck(url: URL | undefined): url is URL {
    if (url) {
        const usesSupportedProtocol = !!SUPPORTED_PROTOCOLS.find(
            (protocol) => protocol + ':' === url.protocol,
        );
        if (!usesSupportedProtocol) {
            logWarning({
                text: `unsupported attachment protocol`,
                url: url.href,
            });
        }
        return usesSupportedProtocol;
    } else {
        return false;
    }
}

export function getAttachments(envelop: Envelop): URL[] {
    if (!envelop.message.attachments) {
        return [];
    }

    return envelop.message.attachments
        .map((attachmentURI) => {
            try {
                return new URL(attachmentURI);
            } catch (error) {
                logError({ text: `couldn't prarse URI`, attachmentURI });
                return undefined;
            }
        })
        .filter(uriCheck);
}
