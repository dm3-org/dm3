import axios from 'axios';
import { Message, createEnvelop, createMessage } from 'dm3-lib-messaging';
import { useContext, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GlobalContext } from '../context/GlobalContext';
import { DeliveryServiceClient } from '../http/DeliveryServiceClient';
import { sha256, stringify } from 'dm3-lib-shared';

const useMessages = () => {
    const [messages, _setMessages] = useState<Message[]>([]);
    const existingMessagesSet = useRef(new Set());

    const { ensName, profileKeys, token } = useContext(AuthContext);
    const {
        web3Provider,
        clientProps: { billboardId, mockedApi },
    } = useContext(GlobalContext);

    const hashMessage = (msg: Message) => sha256(stringify(msg));

    const setMessages = (msgs: Message[]) => {
        _setMessages(msgs);
        existingMessagesSet.current = new Set(msgs.map(hashMessage));
    };

    const addMessage = (msg: Message) => {
        //Message already exists
        const msgHash = hashMessage(msg);

        if (existingMessagesSet.current.has(msgHash)) {
            return;
        }

        existingMessagesSet.current.add(msgHash);

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
        ).submitMessage(envelop, token);
    };

    return {
        messages,
        setMessages,
        addMessage,
        sendDm3Message,
    };
};

export default useMessages;
