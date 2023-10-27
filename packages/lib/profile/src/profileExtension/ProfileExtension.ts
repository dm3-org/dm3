export type MessageType =
    | 'NEW'
    | 'DELETE_REQUEST'
    | 'EDIT'
    | 'REPLY'
    | 'REACTION'
    | 'READ_RECEIPT'
    | 'RESEND_REQUEST'
    | 'LINK';

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
