import axios from 'axios';
import { Message, createEnvelop, createMessage } from 'dm3-lib-messaging';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GlobalContext } from '../context/GlobalContext';
import { DeliveryServiceClient } from '../http/DeliveryServiceClient';

const useMessages = () => {
    const [messages, _setMessages] = useState<Message[]>([]);
    const { ensName, profileKeys } = useContext(AuthContext);
    const {
        web3Provider,
        clientProps: { billboardId, mockedApi },
    } = useContext(GlobalContext);

    const setMessages = (msgs: Message[]) => {
        _setMessages(msgs);
    };

    const addMessage = (msg: Message) => {
        _setMessages((prev) => [...prev, msg]);
    };

    const sendDm3Message = async (text: string) => {
        const message = await createMessage(
            billboardId,
            ensName,
            text,
            profileKeys.signingKeyPair.privateKey,
        );
        if (mockedApi) {
            addMessage(message);
            return;
        }

        //Build envelop

        const { encryptedEnvelop: envelop, sendDependencies } =
            await createEnvelop(
                message,
                web3Provider,
                profileKeys,
                (url: string) => axios.get(url),
            );

        //Submit msg
        await DeliveryServiceClient(
            sendDependencies.deliverServiceProfile.url,
        ).submitMessage(envelop);
    };

    return {
        messages,
        setMessages,
        addMessage,
        sendDm3Message,
    };
};

export default useMessages;
