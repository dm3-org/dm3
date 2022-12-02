import { MessageType } from '../../messaging/Messaging';

export interface MutableProfileExtension {
    // the minimum nonce of the sender's address
    // (optional)
    minNonce?: string;
    // the minimum balcance of the senders address
    // (optional)
    minBalance?: string;
    // token address, which shoould be evaluated.
    // Empty address means Ether balance.
    // (optional)
    minBalanceTokenAddress?: string;
    // Request of a specific ancryption algorithm.
    // (optional)
    encryptionAlgorithm?: string[];

    // List not supported message types
    notSupportedMessageTypes: MessageType[];
}
