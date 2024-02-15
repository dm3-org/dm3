import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';
import { useCallback, useContext, useEffect, useState } from 'react';
import { handleNewMessage } from '../../components/DM3/bl';
import { ConnectionType } from '../../utils/enum-type-utils';
import { AuthContext } from '../../context/AuthContext';
import { getDeliveryServiceProfile } from '@dm3-org/dm3-lib-profile';
import { useMainnetProvider } from '../mainnetprovider/useMainnetProvider';
import axios from 'axios';
import socketIOClient from 'socket.io-client';
import { GlobalContext } from '../../utils/context-utils';
import { Socket } from 'socket.io-client';

export const useWebSocket = () => {
    const { isLoggedIn, account, deliveryServiceToken } =
        useContext(AuthContext);
    const mainnetProvider = useMainnetProvider();

    const [deliveryServiceUrl, setdeliveryServiceUrl] = useState('');
    const [socket, setSocket] = useState<Socket>();

    useEffect(() => {
        const getDeliveryServiceUrl = async () => {
            if (deliveryServiceUrl !== '') {
                return;
            }
            if (account === undefined) {
                return;
            }
            const deliveryServiceProfile = await getDeliveryServiceProfile(
                account.profile!.deliveryServices[0],
                mainnetProvider!,
                async (url: string) => (await axios.get(url)).data,
            );

            setdeliveryServiceUrl(deliveryServiceProfile!.url);
        };
        getDeliveryServiceUrl();
    }, [account?.profile]);

    useEffect(() => {
        if (isLoggedIn && deliveryServiceUrl) {
            if (!account?.profile) {
                throw Error('Could not get account profile');
            }

            const socket = socketIOClient(
                deliveryServiceUrl.replace('/api', ''),
                {
                    autoConnect: false,
                    transports: ['websocket'],
                },
            );

            socket.auth = {
                account: account,
                token: deliveryServiceToken!,
            };
            socket.connect();
            setSocket(socket);
        }
    }, [isLoggedIn, deliveryServiceUrl]);

    const onNewMessage = useCallback(
        (cb: OnNewMessagCallback) => {
            if (!socket) {
                return;
            }
            socket.on('message', (envelop: EncryptionEnvelop) => {
                cb(envelop);
            });
        },
        [socket],
    );

    const removeOnNewMessageListener = useCallback(() => {
        socket?.removeListener('message');
    }, [socket]);

    return { onNewMessage, socket, removeOnNewMessageListener };
};

export type OnNewMessagCallback = (envelop: EncryptionEnvelop) => void;
