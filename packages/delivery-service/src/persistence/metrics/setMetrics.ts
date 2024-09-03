import { Redis, RedisPrefix } from '../getDatabase';

const INTERVAL_SECONDS = 60; // Example interval length in seconds
const RETAIN_INTERVALS = 10; // Number of intervals to retain

export async function countMessage(
    redis: Redis,
    date: Date,
    messageSizeBytes: number,
): Promise<void> {
    const timestamp =
        Math.floor(date.getTime() / 1000 / INTERVAL_SECONDS) * INTERVAL_SECONDS;
    const keyPrefix = `metrics:${timestamp}`;

    // Increment the message count, starting at 0 if the key doesn't exist
    await redis.incrBy(`${keyPrefix}:messageCount`, 1);

    // Increment the message size bytes, starting at 0 if the key doesn't exist
    await redis.incrBy(`${keyPrefix}:messageSizeBytes`, messageSizeBytes);

    // Set expiration
    await redis.expire(
        `${keyPrefix}:messageCount`,
        INTERVAL_SECONDS * RETAIN_INTERVALS,
    );
    await redis.expire(
        `${keyPrefix}:messageSizeBytes`,
        INTERVAL_SECONDS * RETAIN_INTERVALS,
    );
}

export async function countNotification(
    redis: Redis,
    date: Date,
    notificationCount: number,
): Promise<void> {
    const timestamp =
        Math.floor(date.getTime() / 1000 / INTERVAL_SECONDS) * INTERVAL_SECONDS;
    const keyPrefix = `metrics:${timestamp}`;

    // Increment the notification count, starting at 0 if the key doesn't exist
    await redis.incrBy(`${keyPrefix}:notificationCount`, notificationCount);

    // Set expiration
    await redis.expire(
        `${keyPrefix}:notificationCount`,
        INTERVAL_SECONDS * RETAIN_INTERVALS,
    );
}
