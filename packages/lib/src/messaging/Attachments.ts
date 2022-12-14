import { log } from '../shared/log';
import { Envelop } from './Envelop';

const SUPPORTED_PROTOCOLS = ['http', 'https', 'data'];

function uriCheck(url: URL | undefined): url is URL {
    if (url) {
        const usesSupportedProtocol = !!SUPPORTED_PROTOCOLS.find(
            (protocol) => protocol + ':' === url.protocol,
        );
        if (!usesSupportedProtocol) {
            log(`unsupported attachment protocol: ${url.href}`);
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
            } catch (e) {
                log(`couldn't prarse URI: ${attachmentURI}`);
                return undefined;
            }
        })
        .filter(uriCheck);
}
