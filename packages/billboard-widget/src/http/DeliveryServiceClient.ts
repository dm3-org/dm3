import axios from 'axios';
import {
    EncryptionEnvelop,
    createJsonRpcCallSubmitMessage,
} from '@dm3-org/dm3-lib-messaging';
import { SignedUserProfile, normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { logError } from '@dm3-org/dm3-lib-shared';

export const DeliveryServiceClient = (url: string) => {
    const submitMessage = (envelop: EncryptionEnvelop, token: string) => {
        const req = createJsonRpcCallSubmitMessage(envelop, token);

        return axios.post(`/rpc`, req, { baseURL: url });
    };

    const submitUserProfile = async (
        ensName: string,
        signedUserProfile: SignedUserProfile,
    ): Promise<string | null> => {
        const path = `profile/${normalizeEnsName(ensName)}`;

        try {
            const { data } = await axios.post(path, signedUserProfile, {
                baseURL: url,
            });
            return data;
        } catch (error) {
            logError({ text: "can't submit userProfile to ds ", error, path });
            return null;
        }
    };

    return {
        submitMessage,
        submitUserProfile,
    };
};
