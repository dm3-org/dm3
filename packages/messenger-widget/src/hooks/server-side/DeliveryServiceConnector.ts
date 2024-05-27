import { Acknoledgment } from '@dm3-org/dm3-lib-delivery';
import { ServerSideConnector } from './ServerSideConnector';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';

// WORK HERE
export class DeliveryServiceConnector extends ServerSideConnector {
    public async getDeliveryServiceProperties() {
        const url = '/rpc';
        const { data } = await this.getAuthenticatedAxiosClient().post(url, {
            jsonrpc: '2.0',
            method: 'dm3_getDeliveryServiceProperties',
            params: [],
        });
        return JSON.parse(data.result);
    }

    public async syncAcknowledgement(
        ensName: string,
        acknoledgments: Acknoledgment[],
        lastSyncTime: number,
    ) {
        const url = `/delivery/messages/${normalizeEnsName(
            ensName,
        )}/syncAcknowledgment/${lastSyncTime}`;

        return await this.getAuthenticatedAxiosClient().post(url, {
            acknoledgments,
        });
    }

    public getNewMessages(ensName: string, contactEnsName: string) {
        const url = `/getNewMessages/${contactEnsName}`;
        return this.getAuthenticatedAxiosClient().get(url);
    }
}
