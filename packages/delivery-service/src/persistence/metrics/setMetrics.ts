import { Redis, RedisPrefix } from '../getDatabase';

// todo: add loader function like in server-side utils
const INTERVAL_SECONDS = parseInt(
    process.env.METRICS_INTERVAL_SECONDS || '86400',
); // 1 day
const RETAIN_INTERVALS = parseInt(
    process.env.METRICS_INTERVAL_RETENTION_COUNT || '10',
);

function getKeyIntervalTimestamp(): string {
    const currentDate = new Date();
    const timestamp =
        Math.floor(currentDate.getTime() / 1000 / INTERVAL_SECONDS) *
        INTERVAL_SECONDS;
    return `${timestamp}`;
}

export async function countMessage(
    redis: Redis,
    messageSizeBytes: number,
): Promise<void> {
    const timestamp = getKeyIntervalTimestamp();

    // Increment the message count, starting at 0 if the key doesn't exist
    await redis.incrBy(`${RedisPrefix.MetricsMessageCount}${timestamp}`, 1);

    // Increment the message size bytes, starting at 0 if the key doesn't exist
    await redis.incrBy(
        `${RedisPrefix.MetricsMessageSize}${timestamp}`,
        messageSizeBytes,
    );

    // Set expiration
    await redis.expire(
        `${RedisPrefix.MetricsMessageCount}${timestamp}`,
        INTERVAL_SECONDS * RETAIN_INTERVALS,
    );
    await redis.expire(
        `${RedisPrefix.MetricsMessageSize}${timestamp}`,
        INTERVAL_SECONDS * RETAIN_INTERVALS,
    );
}

export async function countNotification(redis: Redis): Promise<void> {
    const timestamp = getKeyIntervalTimestamp();

    // Increment the notification count, starting at 0 if the key doesn't exist
    await redis.incrBy(
        `${RedisPrefix.MetricsNotificationCount}${timestamp}`,
        1,
    );

    // Set expiration
    await redis.expire(
        `${RedisPrefix.MetricsNotificationCount}${timestamp}`,
        INTERVAL_SECONDS * RETAIN_INTERVALS,
    );
}
