import { log } from '../shared/log';
import { Envelop } from './Messaging';

const SUPPORTED_PROTOCOLS = ['http', 'https', 'data'];

function uriCheck(url: URL | undefined): boolean {
    if (url) {
<<<<<<< HEAD
        const usesSupportedProtocol = !!SUPPORTED_PROTOCOLS.find(
            (protocol) => protocol + ':' === url.protocol,
        );
=======
        const usesSupportedProtocol =
            SUPPORTED_PROTOCOLS.find(
                (protocol) => protocol + ':' === url.protocol,
            ) !== undefined;
>>>>>>> 88b8a2a (feat: use URIs for attachments)
        if (!usesSupportedProtocol) {
            log(`unsupported attachment protocol: ${url.href}`);
        }
        return usesSupportedProtocol;
    } else {
        return false;
    }
}

export function getAttachments(envelop: Envelop): URL[] {
    return envelop.message.attachments
        ? (envelop.message.attachments
              .map((attachmentURI) => {
                  try {
                      return new URL(attachmentURI);
                  } catch (e) {
                      log(`couldn't prarse URI: ${attachmentURI}`);
                      return undefined;
                  }
              })
              .filter(uriCheck) as URL[])
        : [];
}
