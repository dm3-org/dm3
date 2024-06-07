import '@testing-library/jest-dom';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useMessage } from './useMessage';
import { getMockedStorageContext } from '../../context/testHelper/getMockedStorageContext';
import { getMockedConversationContext } from '../../context/testHelper/getMockedConversationContext';
import { getMockedAuthContext } from '../../context/testHelper/getMockedAuthContext';
import { getMockedTldContext } from '../../context/testHelper/getMockedTldContext';
import { AuthContext } from '../../context/AuthContext';
import { TLDContext } from '../../context/TLDContext';
import { DeliveryServiceContext } from '../../context/DeliveryServiceContext';
import { StorageContext } from '../../context/StorageContext';
import { useConversation } from '../conversation/useConversation';
import { getMockedDeliveryServiceContext } from '../../context/testHelper/getMockedDeliveryServiceContext';
import { ConversationContext } from '../../context/ConversationContext';
import {
    DEFAULT_DM3_CONFIGURATION,
    getMockedDm3Configuration,
} from '../../context/testHelper/getMockedDm3Configuration';
import { getDefaultContract } from '../../interfaces/utils';
import { EncryptionEnvelop } from '@dm3-org/dm3-lib-messaging';

describe('useMessage hook test cases', () => {
    const CONTACT_NAME = 'user.dm3.eth';

    it('Should configure useMessage hook', async () => {
        const { result } = renderHook(() => useMessage());
        expect(JSON.stringify(result.current.messages)).toBe(
            JSON.stringify({}),
        );
    });

    it('Should get messages for a contact ', async () => {
        const { result } = renderHook(() => useMessage());
        const messages = await act(async () =>
            result.current.getMessages(CONTACT_NAME),
        );
        expect(messages.length).toBe(0);
    });

    it('Should check contact is loading or not ', async () => {
        const { result } = renderHook(() => useMessage());
        const loading = await act(async () =>
            result.current.contactIsLoading(CONTACT_NAME),
        );
        expect(loading).toBe(false);
    });

    it('Should check contact is loading or not ', async () => {
        const { result } = renderHook(() => useMessage());
        const unreadMsgCount = await act(async () =>
            result.current.getUnreadMessageCount(CONTACT_NAME),
        );
        expect(unreadMsgCount).toBe(0);
    });

    describe('', () => {
        it('should add message from websocket', async () => {
            const configurationContext = getMockedDm3Configuration({
                dm3Configuration: {
                    ...DEFAULT_DM3_CONFIGURATION,
                    defaultContact: 'mydefaultcontract.eth',
                },
            });

            const storageContext = getMockedStorageContext({
                editMessageBatchAsync: jest.fn(),
            });
            const conversationContext = getMockedConversationContext({
                selectedContact: getDefaultContract('max.eth'),
            });
            const deliveryServiceContext = getMockedDeliveryServiceContext({
                //Add websocket mock
                onNewMessage: (cb: Function) => {
                    console.log('on new messagemkmkmk');
                    cb();
                },
                removeOnNewMessageListener: jest.fn(),
            });
            const authContext = getMockedAuthContext({});
            const tldContext = getMockedTldContext({});

            const wrapper = ({ children }: { children: any }) => (
                <>
                    <AuthContext.Provider value={authContext}>
                        <TLDContext.Provider value={tldContext}>
                            <StorageContext.Provider value={storageContext}>
                                <ConversationContext.Provider
                                    value={conversationContext}
                                >
                                    <DeliveryServiceContext.Provider
                                        value={deliveryServiceContext}
                                    >
                                        {children}
                                    </DeliveryServiceContext.Provider>
                                </ConversationContext.Provider>
                            </StorageContext.Provider>
                        </TLDContext.Provider>
                    </AuthContext.Provider>
                </>
            );

            const { result } = renderHook(() => useMessage(), {
                wrapper,
            });
            await waitFor(() =>
                expect(result.current.contactIsLoading('max.eth')).toBe(false),
            );
        });
    });
});
