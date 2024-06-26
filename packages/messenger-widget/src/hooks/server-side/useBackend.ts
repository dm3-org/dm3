import { useContext, useEffect, useState } from 'react';
import { DM3ConfigurationContext } from '../../context/DM3ConfigurationContext';
import { AuthContext } from '../../context/AuthContext';
import { BackendConnector } from './BackendConnector';
import { IBackendConnector } from '@dm3-org/dm3-lib-shared';

export const useBackend = (): IBackendConnector & {
    isInitialized: boolean;
} => {
    const { dm3Configuration } = useContext(DM3ConfigurationContext);
    const { ethAddress, profileKeys, isProfileReady, account } =
        useContext(AuthContext);

    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [beConnector, setbeConnector] = useState<
        BackendConnector | undefined
    >();

    //Reset the hook in case the account changes
    useEffect(() => {
        console.log('reset useBackend');
        setIsInitialized(false);
        setbeConnector(undefined);
    }, [account, isProfileReady]);

    //Initializer for the delivery service connectors
    useEffect(() => {
        const initializeDs = async () => {
            if (!isProfileReady) {
                console.log('profile is not ready');
                return;
            }
            //We only need to initialize the backend connector once si
            const beConnector = new BackendConnector(
                dm3Configuration.backendUrl,
                dm3Configuration.resolverBackendUrl,
                dm3Configuration.addressEnsSubdomain,
                ethAddress!,
                profileKeys!,
            );

            const signedUserProfile = {
                profile: account?.profile!,
                signature: account?.profileSignature!,
            };
            await beConnector.login(signedUserProfile);
            setbeConnector(beConnector);
            setIsInitialized(true);
        };
        initializeDs();
    }, [isProfileReady]);

    return {
        isInitialized,
        addConversation: (ensName: string, encryptedContactName: string) => {
            beConnector?.addConversation(ensName, encryptedContactName);
        },
        getConversations: async (
            ensName: string,
            size: number,
            offset: number,
        ) => {
            return beConnector?.getConversations(ensName, size, offset);
        },
        toggleHideConversation: (
            ensName: string,
            encryptedContactName: string,
            hide: boolean,
        ) => {
            beConnector?.toggleHideConversation(
                ensName,
                encryptedContactName,
                hide,
            );
        },
        getMessagesFromStorage: async (
            ensName: string,
            encryptedContactName: string,
            pageSize: number,
            offset: number,
        ) => {
            return beConnector?.getMessagesFromStorage(
                ensName,
                encryptedContactName,
                pageSize,
                offset,
            );
        },
        addMessage: async (
            ensName: string,
            encryptedContactName: string,
            messageId: string,
            encryptedEnvelopContainer: string,
        ) => {
            return beConnector?.addMessage(
                ensName,
                encryptedContactName,
                messageId,
                encryptedEnvelopContainer,
            );
        },
        addMessageBatch: (
            ensName: string,
            encryptedContactName: string,
            messageBatch: any[],
        ) => {
            beConnector?.addMessageBatch(
                ensName,
                encryptedContactName,
                messageBatch,
            );
        },
        editMessageBatch: (
            ensName: string,
            encryptedContactName: string,
            messageBatch: any[],
        ) => {
            beConnector?.editMessageBatch(
                ensName,
                encryptedContactName,
                messageBatch,
            );
        },
        getNumberOfMessages: async (
            ensName: string,
            encryptedContactName: string,
        ) => {
            return beConnector?.getNumberOfMessages(
                ensName,
                encryptedContactName,
            );
        },
        getNumberOfConversations: async (ensName: string) => {
            return beConnector?.getNumberOfConversations(ensName);
        },
    };
};
