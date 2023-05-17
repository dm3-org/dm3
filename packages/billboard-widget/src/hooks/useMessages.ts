import axios from 'axios';
import { Message, createEnvelop, createMessage } from 'dm3-lib-messaging';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GlobalContext } from '../context/GlobalContext';
import { DeliveryServiceClient } from '../http/DeliveryServiceClient';

import { MessageWithKey } from '../components/MessagesList';
import uniqBy from '../utils/uniqueBy';

const addKey = (msg: Message): MessageWithKey => {
    return {
        ...msg,
        reactKey: `${msg.metadata.timestamp}${msg.metadata.from}${msg.signature}`,
    };
};

const useMessages = () => {
    const [messages, _setMessages] = useState<MessageWithKey[]>([]);
    const { ensName, profileKeys } = useContext(AuthContext);
    const {
        web3Provider,
        clientProps: { billboardId },
    } = useContext(GlobalContext);
    /**
     * Add a message to list.
     * Ensure the message has not already ben fetched.
     *
     * @param msg - Message
     */
    const addMessage = (msg: Message) => {
        const messageWithKey = addKey(msg);
        _setMessages(uniqBy([...messages, messageWithKey], 'reactKey'));
    };

    /**
     * Set messages, ensuring they have a unique reactKey property.
     *
     * @param msgs
     */
    const setMessages = (msgs: Message[]) => {
        _setMessages(msgs?.map(addKey));
    };

    const sendDm3Message = async (text: string) => {
        const message = await createMessage(
            ensName,
            billboardId,
            text,
            profileKeys.signingKeyPair.privateKey,
        );
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
