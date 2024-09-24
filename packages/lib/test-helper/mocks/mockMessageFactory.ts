import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import { addPostmark } from '@dm3-org/dm3-lib-delivery';
import {
    Message,
    MessageState,
    MessageType,
    SendDependencies,
    buildEnvelop,
} from '@dm3-org/dm3-lib-messaging';
import {
    SignedUserProfile,
    ProfileKeys,
    DeliveryServiceProfile,
} from '@dm3-org/dm3-lib-profile';
import { MockedUserProfile } from './mockUserProfile';
import { MockDeliveryServiceProfile } from './mockDeliveryServiceProfile';
import { stringify } from '@dm3-org/dm3-lib-shared';

interface MockChatArgs {
    sender: {
        ensName: string;
        signedUserProfile: SignedUserProfile;
        profileKeys: ProfileKeys;
    };
    receiver: {
        ensName: string;
        signedUserProfile: SignedUserProfile;
        profileKeys: ProfileKeys;
    };
    dsProfile: DeliveryServiceProfile;
}
export const MockMessageFactory = (
    sender: MockedUserProfile,
    receiver: MockedUserProfile,
    dsProfile: MockDeliveryServiceProfile,
) => {
    const createEncryptedEnvelop = async (msg: string) => {
        const message: Message = {
            message: msg,
            metadata: {
                to: receiver.account.ensName,
                from: sender.account.ensName,
                timestamp: Date.now(),
                type: 'NEW',
            },
            signature: '',
        };
        const sendDependencies: SendDependencies = {
            from: {
                ensName: sender.account.ensName,
                profile: sender.signedUserProfile.profile,
                profileSignature: sender.signedUserProfile.signature,
            },
            to: {
                ensName: receiver.account.ensName,
                profile: receiver.signedUserProfile.profile,
                profileSignature: receiver.signedUserProfile.signature,
            },
            deliverServiceProfile: dsProfile.deliveryServiceProfile,
            keys: sender.profileKeys,
        };

        try {
            const { encryptedEnvelop } = await buildEnvelop(
                message,
                encryptAsymmetric,
                sendDependencies,
            );
            const postmark = await addPostmark(
                encryptedEnvelop,
                receiver.profileKeys.encryptionKeyPair.publicKey,
                dsProfile.keys.signingKeyPair.privateKey,
            );
            return { ...encryptedEnvelop, postmark: stringify(postmark) };
        } catch (err) {
            throw err;
        }
    };
    const createEnvelop = async (msg: string) => {
        const message: Message = {
            message: msg,
            metadata: {
                to: receiver.account.ensName,
                from: sender.account.ensName,
                timestamp: Date.now(),
                type: 'NEW',
            },
            signature: '',
        };
        const sendDependencies: SendDependencies = {
            from: {
                ensName: sender.account.ensName,
                profile: sender.signedUserProfile.profile,
                profileSignature: sender.signedUserProfile.signature,
            },
            to: {
                ensName: receiver.account.ensName,
                profile: receiver.signedUserProfile.profile,
                profileSignature: receiver.signedUserProfile.signature,
            },
            deliverServiceProfile: dsProfile.deliveryServiceProfile,
            keys: sender.profileKeys,
        };

        try {
            const { envelop } = await buildEnvelop(
                message,
                encryptAsymmetric,
                sendDependencies,
            );
            return envelop;
        } catch (err) {
            throw err;
        }
    };
    const createStorageEnvelopContainer = async (
        msg: string,
        messageState: MessageState = MessageState.Created,
        type: MessageType = 'NEW',
        referenceMessageHash: string = '',
    ) => {
        const message: Message = {
            message: msg,
            metadata: {
                to: receiver.account.ensName,
                from: sender.account.ensName,
                timestamp: Date.now(),
                referenceMessageHash,
                type,
            },
            signature: '',
        };
        const sendDependencies: SendDependencies = {
            from: {
                ensName: sender.account.ensName,
                profile: sender.signedUserProfile.profile,
                profileSignature: sender.signedUserProfile.signature,
            },
            to: {
                ensName: receiver.account.ensName,
                profile: receiver.signedUserProfile.profile,
                profileSignature: receiver.signedUserProfile.signature,
            },
            deliverServiceProfile: dsProfile.deliveryServiceProfile,
            keys: sender.profileKeys,
        };

        try {
            const { envelop } = await buildEnvelop(
                message,
                encryptAsymmetric,
                sendDependencies,
            );
            return {
                envelop,
                messageState,
            };
        } catch (err) {
            throw err;
        }
    };
    const createMessageModel = async (
        msg: string,
        type: MessageType,
        referenceMessageHash: string = '',
    ) => {
        const container = await createStorageEnvelopContainer(
            msg,
            MessageState.Created,
            type,
            referenceMessageHash,
        );
        return {
            ...container,
            reactions: [],
            source: 0,
        };
    };

    const createMessage = async (msg: string) => {
        const message: Message = {
            message: msg,
            metadata: {
                to: receiver.account.ensName,
                from: sender.account.ensName,
                timestamp: Date.now(),
                type: 'NEW',
            },
            signature: '',
        };

        return message;
    };

    return {
        createEncryptedEnvelop,
        createMessage,
        createEnvelop,
        createStorageEnvelopContainer,
        createMessageModel,
    };
};
