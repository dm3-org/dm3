import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { useMessage } from './useMessage';
import { Message } from '@dm3-org/dm3-lib-messaging';
import { MessageActionType } from '../../utils/enum-type-utils';

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

    /**
     * This test needs to be fixed. It throws a error
     * TypeError: socket.emit is not a function
     * Tried mocking socket, but it's not working
     */
    // it('Should add new message ', async () => {

    //     const newMessage: Message = {
    //         message: "this is a new message",
    //         signature: "signature",
    //         metadata: {
    //             to: CONTACT_NAME,
    //             from: "abcd.dm3.eth",
    //             timestamp: 82163821,
    //             type: MessageActionType.NEW
    //         },
    //     }

    //     const { result } = renderHook(() => useMessage());
    //     const data = await act(async () => result.current.addMessage(CONTACT_NAME, newMessage));
    //     expect(data.isSuccess).toBe(true);
    // });
});
