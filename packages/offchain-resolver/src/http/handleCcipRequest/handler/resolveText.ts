import express from 'express';
import { IDatabase } from '../../../persistance/IDatabase';

export async function handleText(
    res: express.Response,
    db: IDatabase,
    request: any,
) {
    const { record, name } = request;
    if (record !== 'dm3.profile') {
        return res.status(400).send({
            message: `Record is not supported by this resolver`,
        });
    }

    const response = await db.getUserProfile(name);

    if (!response) {
        return res.status(404).send({ message: 'Profile not found' });
    }
    return response;
}
