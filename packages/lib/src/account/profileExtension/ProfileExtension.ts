import { MessageType } from '../../messaging/Messaging';

export interface ProfileExtension {
    encryptionAlgorithm?: string[];
    // List not supported message types
    notSupportedMessageTypes: MessageType[];
}

export function getDefaultProfileExtension(): ProfileExtension {
    return {
        notSupportedMessageTypes: ['NEW'],
    };
}
