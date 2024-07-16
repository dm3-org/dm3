import { getRedisClient } from './getDatabase';
export type Redis = Awaited<ReturnType<typeof getRedisClient>>;

export function printAllRedisSessions(client: Redis): void {
    const keys: string[] = [];

    async () => {
        for await (const key of client.scanIterator({
            MATCH: 'session:*',
        })) {
            keys.push(key.split(':')[2]);
            const value = await client.get(key);
            console.log('Redis Sessions: ' + key + value);
        }
    };
}

// // Example usage
// getKeysByPrefix('yourPrefix', (err, keys) => {
//     if (err) {
//         console.error('Error fetching keys:', err);
//     } else {
//         console.log(keys);
//     }
// });
