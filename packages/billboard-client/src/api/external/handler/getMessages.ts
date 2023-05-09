import { IDatabase } from '../../../persitance/getDatabase';

export function getMessagesHandler(db: IDatabase): IRpcCallHandler {
    return {
        method: 'dm3_billboard_getMessages',
        handle: async ([idBillboard, time, limit]: string[]) => {
            const timeNumber: number = Number(time);
            const limitNumber: number = Number(limit);

            if (isNaN(timeNumber) || isNaN(limitNumber)) {
                return {
                    status: 'failed',
                    message: 'invalid params',
                };
            }
            return {
                status: 'success',
                value: await db.getMessages(
                    idBillboard,
                    timeNumber,
                    limitNumber,
                ),
            };
        },
    };
}
