import { ethersHelper, logInfo } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import express from 'express';
import { WithLocals } from './types';

export function link(web3Provider: ethers.providers.BaseProvider) {
    const router = express.Router();

    router.post(
        '/',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const { ownerName, lspName, linkMessage, signature } = req.body;

                if (!ownerName || !lspName || !linkMessage || !signature) {
                    return res.status(400).send({
                        error: 'invalid schema',
                    });
                }
                logInfo({ text: `POST link`, ensName: lspName });

                //check owner address to ensure that ownerName and the signed signature belong together
                const ownerAddress = await web3Provider.resolveName(ownerName);

                if (!ownerAddress) {
                    return res.status(400).send({
                        error: 'could not resolve owner address',
                    });
                }

                //Check if the request comes from the owner of the name
                const sigIsValid = await ethersHelper.checkSignature(
                    linkMessage,
                    ownerAddress,
                    signature,
                );

                if (!sigIsValid) {
                    global.logger.warn('signature invalid');

                    return res.status(400).send({
                        error: 'signature invalid',
                    });
                }

                if (!(await req.app.locals.db.setLink(ownerName, lspName))) {
                    return res
                        .status(400)
                        .send({ error: 'Could not create alias' });
                }

                return res.sendStatus(200);
            } catch (e) {
                next(e);
            }
        },
    );

    return router;
}
