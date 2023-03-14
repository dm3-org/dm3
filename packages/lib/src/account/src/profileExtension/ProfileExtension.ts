//TODO import from message package if possbile. If not find a better way to import
export type MessageType =
    | 'NEW'
    | 'DELETE_REQUEST'
    | 'EDIT'
    | 'REPLY'
    | 'REACTION'
    | 'READ_RECEIPT'
    | 'RESEND_REQUEST';

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
