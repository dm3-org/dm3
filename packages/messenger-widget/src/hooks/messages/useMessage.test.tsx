import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { useMessage } from './useMessage';
import {
    ConversationContext,
    ConversationContextType,
} from '../../context/ConversationContext';
import { ContactPreview } from '../../interfaces/utils';
import { Message } from '@dm3-org/dm3-lib-messaging';
import { getAccountDisplayName } from '@dm3-org/dm3-lib-profile';

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

    // describe('add message', () => {
    //     it.only('context text', async () => {

    //         const mockContact = {
    //             name: getAccountDisplayName('bob.eth', 25),
    //             message: null,
    //             image: '',
    //             unreadMsgCount: 0,
    //             messageCount: 0,
    //             contactDetails: {
    //                 account: {
    //                     ensName: 'bob.eth',
    //                 },
    //                 deliveryServiceProfile: undefined,
    //             },
    //             isHidden: false,
    //             messageSizeLimit: 0,
    //         }

    //         const converationContext: ConversationContextType = {
    //             contacts: [mockContact],
    //             conversationCount: 0,
    //             setSelectedContactName: function (contactEnsName: string | undefined): void {
    //                 throw new Error('Function not implemented.');
    //             },
    //             initialized: false,
    //             addConversation: function (ensName: string): ContactPreview {
    //                 throw new Error('Function not implemented.');
    //             },
    //             hideContact: function (ensName: string): void {
    //                 throw new Error('Function not implemented.');
    //             }
    //         }

    //         const wrapper = ({ children }: { children: any }) => (
    //             <ConversationContext.Provider value={converationContext}>{children}</ConversationContext.Provider>
    //         );

    //         const msg = {} as Message

    //         const { result } = renderHook(() => useMessage(), { wrapper });
    //         await act(async () =>
    //             result.current.addMessage('alice.eth', msg),
    //         );

    //     });
    // })
});
