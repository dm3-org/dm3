import cors from 'cors';
import { NotificationChannelType } from 'dm3-lib-delivery/dist.backend';
import { normalizeEnsName } from 'dm3-lib-profile/dist.backend';
import express from 'express';
import { auth } from './utils';

export default () => {
    const router = express.Router();

    router.use(cors());
    router.param('ensName', auth);

    router.post('/email/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);

            const { recipientAddress } = req.body;

            await req.app.locals.db.addUsersNotificationChannel(account, {
                type: NotificationChannelType.EMAIL,
                config: {
                    recipientAddress,
                },
            });
            res.send(200);
        } catch (e) {
            next(e);
        }
    });
    router.get('/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);

            const notificationChannels =
                await req.app.locals.db.getUsersNotificationChannels(account);

            res.json(notificationChannels);
        } catch (e) {
            next(e);
        }
    });

    return router;
};
