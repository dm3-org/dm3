import { IDatabase } from '../persistance/getDatabase';
import { logInfo } from 'dm3-lib-shared';

//1 day
const DEFAULT_CLEANUP_INTERVAL = 86400000;

async function onCleanUpPendingMessages(db: IDatabase, ttl: number) {
    const now = new Date().getTime();
    const expiryDate = now - ttl;
    logInfo('[Clean up] Delete expired messages');
    await db.deleteExpiredMessages(expiryDate);
}

export function startCleanUpPendingMessagesJob(
    db: IDatabase,
    ttl: number,
    cleaningInterval: number = DEFAULT_CLEANUP_INTERVAL,
): NodeJS.Timer | undefined {
    // eslint-disable-next-line max-len
    //If ttl is 0 or below the cleanup job should not be started hence the deliveryService keeps pending messages forever
    if (ttl <= 0) {
        return;
    }
    logInfo('[Clean up] Start Clean up job');
    return setInterval(() => {
        onCleanUpPendingMessages(db, ttl);
    }, cleaningInterval);
}
