import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { ServerSideConnector } from './ServerSideConnector';

export class BackendConnector
    extends ServerSideConnector
    implements IBackendConnector
{
    public addConversation(ensName: string, encryptedContactName: string) {
        const url = `/${normalizeEnsName(ensName)}/addConversation`;
        this.getAuthenticatedAxiosClient().post(url, {
            encryptedContactName,
        });
    }
    public async getConversations(ensName: string) {
        const url = `/${normalizeEnsName(ensName)}/getConversations`;
        const { data } = await this.getAuthenticatedAxiosClient().get(url);
        return data ?? [];
    }
    public async toggleHideConversation(
        ensName: string,
        encryptedContactName: string,
        hide: boolean,
    ) {
        const url = `/${normalizeEnsName(ensName)}/toggleHideConversation`;
        this.getAuthenticatedAxiosClient().post(url, {
            encryptedContactName,
            hide,
        });
    }
    public async getMessagesFromStorage(
        ensName: string,
        encryptedContactName: string,
        pageNumber: number,
    ) {
        const url = `/${normalizeEnsName(
            ensName,
        )}/getMessages/${encryptedContactName}/${pageNumber}`;

        const { data } = await this.getAuthenticatedAxiosClient().get(url);

        return (
            data.map((message: any) => {
                return JSON.parse(message);
            }) ?? []
        );
    }

    public async addMessage(
        ensName: string,
        encryptedContactName: string,
        messageId: string,
        encryptedEnvelopContainer: string,
    ) {
        const url = `/${normalizeEnsName(ensName)}/addMessage`;
        await this.getAuthenticatedAxiosClient().post(url, {
            encryptedContactName,
            messageId,
            encryptedEnvelopContainer,
        });
    }

    public async addMessageBatch(
        ensName: string,
        encryptedContactName: string,
        messageBatch: any[],
    ) {
        const url = `/${normalizeEnsName(ensName)}/addMessageBatch`;
        const { status } = await this.getAuthenticatedAxiosClient().post(url, {
            encryptedContactName,
            messageBatch,
        });
        if (status !== 200) {
            throw Error('Unable to edit message batch');
        }
    }
    public async editMessageBatch(
        ensName: string,
        encryptedContactName: string,
        messageBatch: any[],
    ) {
        const url = `/${normalizeEnsName(ensName)}/editMessageBatch`;
        await this.getAuthenticatedAxiosClient().post(url, {
            encryptedContactName,
            messageBatch,
        });
    }
    public async getNumberOfMessages(
        ensName: string,
        encryptedContactName: string,
    ) {
        const url = `/${normalizeEnsName(
            ensName,
        )}/getNumberOfMessages/${encryptedContactName}`;
        const { data } = await this.getAuthenticatedAxiosClient().get(url);
        return data ?? 0;
    }

    public async getNumberOfConversations(ensName: string) {
        const url = `/${normalizeEnsName(ensName)}/getNumberOfConversations`;
        const { data } = await this.getAuthenticatedAxiosClient().get(url);
        return data ?? 0;
    }
}
