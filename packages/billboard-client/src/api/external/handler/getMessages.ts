import { IDatabase } from '../../../persitance/getDatabase';

export function getMessagesHandler(db: IDatabase): IRpcCallHandler {
    return {
        method: 'dm3_billboard_getMessages',
        handle: async ([idBillboard, time, limit]: string[]) => {
            //If the time is undefined we use the default params.
            //Otherwise we've to cast string to a number which can be NaN in cases of invalid params
            const timeNumber: number = time === undefined ? 0 : Number(time);
            //If the limit is undefined we use the default params.
            //Otherwise we've to cast string to a number which can be NaN in cases of invalid params
            const limitNumber: number = limit === undefined ? 0 : Number(limit);

            if (isNaN(timeNumber) || isNaN(limitNumber)) {
                return {
                    status: 'failed',
                    message: 'invalid params',
                };
            }
            return {
                status: 'success',
                value: {
                    messages: await db.getMessages(
                        idBillboard,
                        timeNumber,
                        limitNumber,
                    ),
                },
            };
        },
    };
}
