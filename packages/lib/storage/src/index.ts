export { getDm3Storage, useDm3Storage } from './location/Dm3Storage';

export { googleLoad, googleStore } from './location/GoogleDrive';

export {
    StorageLocation,
    SyncProcessState,
    createDB,
    createEmptyConversation,
    getConversation,
    getConversationId,
    load,
    sortEnvelops,
    sync,
} from './Storage';

export { createStorage } from './new';
export { createRemoteKeyValueStoreApi } from './new/RemoteInterface';

export { web3Load, web3Store } from './location/Web3Storage';

export { createTimestamp } from './Utils';

export type { StorageEnvelopContainer, UserDB, UserStorage } from './Storage';
