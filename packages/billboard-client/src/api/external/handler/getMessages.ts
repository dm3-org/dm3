export function getMessagesHandler(): IRpcCallHandler {
    return {
        method: 'dm3_billboard_getMessages',
        handle: ([idBillboard, time, idMessageCursor]: string[]) => {
            return Promise.resolve({
                status: 'success',
                value: '',
            });
        },
    };
}
