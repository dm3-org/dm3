import { encryptAsymmetric } from "dm3-lib-crypto";
import { Message, SendDependencies, buildEnvelop } from "dm3-lib-messaging";
import { SignedUserProfile, ProfileKeys } from "dm3-lib-profile";

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
    dsKey: string;
}
export const MockMessageFactory = ({ sender, receiver, dsKey }: MockChatArgs) => {
    const sendMessage = async (msg: string) => {
        const message: Message = {
            message: msg,
            metadata: {
                to: receiver.ensName,
                from: sender.ensName,
                timestamp: Date.now(),
                type: 'NEW',
            },
            signature: '',
        };
        const sendDependencies: SendDependencies = {
            from: {
                ensName: sender.ensName,
                profile: sender.signedUserProfile.profile,
                profileSignature: sender.signedUserProfile.signature,
            },
            to: {
                ensName: receiver.ensName,
                profile: receiver.signedUserProfile.profile,
                profileSignature: receiver.signedUserProfile.signature,
            },
            deliveryServiceEncryptionPubKey: dsKey,
            keys: sender.profileKeys,
        };

        const { encryptedEnvelop } = await buildEnvelop(
            message,
            encryptAsymmetric,
            sendDependencies,
        );
        return encryptedEnvelop;
    };
    return {
        createMessage: sendMessage,
    };
};
