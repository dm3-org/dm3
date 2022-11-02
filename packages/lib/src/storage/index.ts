import { getSymmetricalKeyFromSignature } from '../encryption/SymmetricalEncryption';
import { prersonalSign } from '../external-apis/InjectedWeb3API';
import { Connection } from '../web3-provider/Web3Provider';
import { UserStorage, load as execLoad } from './Storage';

export { useDm3Storage, getDm3Storage } from './Dm3Storage';

export { googleLoad, googleStore } from './GoogleDrive';

export {
    createDB,
    getConversationId,
    sync,
    sortEnvelops,
    getConversation,
    StorageLocation,
    SyncProcessState,
} from './Storage';

export { web3Store, web3Load } from './Web3Storage';

export { createTimestamp } from './Utils';

export type { UserDB, StorageEnvelopContainer, UserStorage } from './Storage';

export function load(connection: Connection, data: UserStorage, key?: string) {
    return execLoad(
        connection,
        data,
        getSymmetricalKeyFromSignature,
        prersonalSign,
        key,
    );
}
