import { Redis } from '../getDatabase';

export function getMessages(redis: Redis) {
    return (idBillboard: string, time?: number, idMessageCursor?: string) => {};
}
