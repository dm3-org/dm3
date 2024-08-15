import { Acknowledgement } from '@dm3-org/dm3-lib-delivery';
import { ServerSideConnector } from './ServerSideConnector';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

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
        acknowledgements: Acknowledgement[],
    ) {
        const url = `/delivery/messages/${normalizeEnsName(
            ensName,
        )}/syncAcknowledgements/`;

        return await this.getAuthenticatedAxiosClient().post(url, {
            acknowledgements,
        });
    }

    public getNewMessages(ensName: string, contactEnsName: string) {
        const url = `/getNewMessages/${contactEnsName}`;
        return this.getAuthenticatedAxiosClient().get(url);
    }

    public async addNotificationChannel(
        ensName: string,
        recipientValue: string,
        notificationChannelType: NotificationChannelType,
    ) {
        const url = `/notifications/${normalizeEnsName(ensName)}`;
        const { data, status } = await this.getAuthenticatedAxiosClient().post(
            url,
            {
                recipientValue,
                notificationChannelType,
            },
        );
        return { data, status };
    }

    public async sendOtp(
        ensName: string,
        notificationChannelType: NotificationChannelType,
    ) {
        const url = `/notifications/otp/${normalizeEnsName(ensName)}`;
        const { data, status } = await this.getAuthenticatedAxiosClient().post(
            url,
            {
                notificationChannelType,
            },
        );
        return { data, status };
    }

    public async verifyOtp(
        ensName: string,
        otp: string,
        notificationChannelType: NotificationChannelType,
    ) {
        const url = `/notifications/otp/verify/${normalizeEnsName(ensName)}`;
        const { data, status } = await this.getAuthenticatedAxiosClient().post(
            url,
            {
                otp,
                notificationChannelType,
            },
        );
        return { data, status };
    }

    public async fetchIncomingMessages(ensName: string) {
        const url = `/delivery/messages/incoming/${normalizeEnsName(ensName)}/`;
        const { data } = await this.getAuthenticatedAxiosClient().get(url);
        return data;
    }

    public async getGlobalNotification(ensName: string) {
        const url = `/notifications/global/${normalizeEnsName(ensName)}`;
        const { data, status } = await this.getAuthenticatedAxiosClient().get(
            url,
        );
        return { data, status };
    }

    public async getAllNotificationChannels(ensName: string) {
        const url = `/notifications/${normalizeEnsName(ensName)}`;
        const { data, status } = await this.getAuthenticatedAxiosClient().get(
            url,
        );
        return { data, status };
    }

    public async toggleGlobalNotifications(
        ensName: string,
        isEnabled: boolean,
    ) {
        const url = `/notifications/global/${normalizeEnsName(ensName)}`;
        const { data, status } = await this.getAuthenticatedAxiosClient().post(
            url,
            { isEnabled },
        );
        return { data, status };
    }

    public async toggleNotificationChannel(
        ensName: string,
        isEnabled: boolean,
        notificationChannelType: NotificationChannelType,
    ) {
        const url = `/notifications/channel/${normalizeEnsName(ensName)}`;
        const { data, status } = await this.getAuthenticatedAxiosClient().post(
            url,
            {
                isEnabled,
                notificationChannelType,
            },
        );
        return { data, status };
    }

    public async removeNotificationChannel(
        ensName: string,
        channelType: NotificationChannelType,
    ) {
        const url = `/notifications/channel/${channelType}/${normalizeEnsName(
            ensName,
        )}`;
        const { data, status } =
            await this.getAuthenticatedAxiosClient().delete(url);
        return { data, status };
    }
    public registerWebSocketListener(
        eventName: string,
        cb: (...args: any[]) => void,
    ) {
        const socket = this.getAuthenticatedWebSocketClient();
        socket.on(eventName, cb);
    }

    public unregisterWebSocketListener(eventName: string) {
        const socket = this.getAuthenticatedWebSocketClient();
        socket.removeListener(eventName);
    }
    public emit = (eventName: string, ...args: any[]) => {
        const socket = this.getAuthenticatedWebSocketClient();
        socket.emit(eventName, ...args);
    };
}
