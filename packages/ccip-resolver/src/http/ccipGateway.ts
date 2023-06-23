import express from 'express';
import { WithLocals } from './types';
import { Config } from '../config/Config';
import { signingHandler } from '../handler/signing/signingHandler';

export function ccipGateway(config: Config) {
    const router = express.Router();

    router.get(
        '/:resolverAddr/:calldata',
        //@ts-ignore
        async (
            req: express.Request & { app: WithLocals },
            res: express.Response,
        ) => {
            const { resolverAddr } = req.params;
            const calldata = req.params.calldata.replace('.json', '');

            req.app.locals.logger.info(`GET ${resolverAddr}`);

            try {
                const configEntry = config[resolverAddr];

                if (configEntry) {
                    switch (configEntry.type) {
                        case 'signing':
                            const response = await signingHandler(
                                calldata,
                                resolverAddr,
                                configEntry,
                            );

                            res.status(200).send({ data: response });
                            break;

                        default:
                            res.status(404).send({
                                message: 'Unsupported entry type',
                            });
                    }
                } else {
                    res.status(404).send({
                        message: 'Unknown resolver selector pair',
                    });
                }
            } catch (e) {
                req.app.locals.logger.warn((e as Error).message);
                res.status(400).send({ message: 'Unknown error' });
            }
        },
    );
    return router;
}
