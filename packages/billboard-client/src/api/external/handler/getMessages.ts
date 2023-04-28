export function getMessagesHandler(): IRpcCallHandler {
    return {
        method: 'dm3_billboard_getMessages',
        handle: (params: string[]) => {
            return Promise.resolve({
                status: 'success',
                value: '',
            });
        },
    };
}
