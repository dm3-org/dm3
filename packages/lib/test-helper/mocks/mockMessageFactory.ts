import { encryptAsymmetric } from '@dm3-org/dm3-lib-crypto';
import {
    Message,
    SendDependencies,
    buildEnvelop,
} from '@dm3-org/dm3-lib-messaging';
import {
    SignedUserProfile,
    ProfileKeys,
    DeliveryServiceProfile,
} from '@dm3-org/dm3-lib-profile';
import { MockedUserProfile } from './mockUserProfile';

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
    dsProfile: DeliveryServiceProfile,
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
            deliverServiceProfile: dsProfile,
            keys: sender.profileKeys,
        };

        try {
            const { encryptedEnvelop } = await buildEnvelop(
                message,
                encryptAsymmetric,
                sendDependencies,
            );
            return encryptedEnvelop;
        } catch (err) {
            throw err;
        }
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
    };
};
