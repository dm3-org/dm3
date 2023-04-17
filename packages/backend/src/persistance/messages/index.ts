import { createMessage } from './createMessage';
import { deleteExpiredMessages } from './deleteExpiredMessages';
import { getMessages } from './getMessages';
import { syncAcknoledgment } from './syncAcknoledgment';
import { getIncomingMessages } from './getIncomingMessages';
export default {
    createMessage,
    deleteExpiredMessages,
    getMessages,
    syncAcknoledgment,
    getIncomingMessages,
};
