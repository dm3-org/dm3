import _sodium from './_libsodium-wrappers';

export const initializeLibSodiumWrapper = async () => {
    //@ts-ignore
    await _sodium.ready;
    const sodium = _sodium as any;
    return sodium;
};
