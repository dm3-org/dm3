import { getUserStorageOld } from './getUserStorageOld';
import { setUserStorageOld } from './setUserStorageOld';
import { addConversation } from './postgres/addConversation';
import { addMessageBatch } from './postgres/addMessageBatch';
import { editMessageBatch } from './postgres/editMessageBatch';
import { getConversationList } from './postgres/getConversationList';
import { getMessages } from './postgres/getMessages';
import { getNumberOfConversations } from './postgres/getNumberOfConversations';
import { getNumberOfMessages } from './postgres/getNumberOfMessages';
import { toggleHideConversation } from './postgres/toggleHideConversation';
import { MessageRecord } from './postgres/dto/MessageRecord';
import { getUserDbMigrationStatus } from './getUserDbMigrationStatus';
import { setUserDbMigrated } from './setUserDbMigrated';
import { getHaltedMessages } from './postgres/haltedMessage/getHaltedMessages';
import { clearHaltedMessage } from './postgres/haltedMessage/clearHaltedMessage';
import { getAccount } from './postgres/getAccount';
import { setAccount } from './postgres/setAccount';

export default {
    getUserStorageOld,
    setUserStorageOld,
    addConversation,
    addMessageBatch,
    editMessageBatch,
    getConversationList,
    getMessages,
    getNumberOfConversations,
    getNumberOfMessages,
    toggleHideConversation,
    getHaltedMessages,
    clearHaltedMessage,
    getUserDbMigrationStatus,
    setUserDbMigrated,
    getAccount,
    setAccount,
};

export type { MessageRecord };
