import { globalConfig, logInfo, validateSchema } from 'dm3-lib-shared';
import { schema, checkUserProfileWithAddress } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import express from 'express';
import { WithLocals } from './types';
import { SiweMessage } from 'siwe';
import { checkSignature } from 'dm3-lib-crypto';

export function profile(web3Provider: ethers.providers.BaseProvider) {
    const router = express.Router();

    //Special route for eth prague
    router.post(
        '/nameP',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const { signedUserProfile, siweMessage, siweSig, hotAddr } =
                    req.body;

                let parsedSiwe;
                try {
                    parsedSiwe = JSON.parse(siweMessage);
                } catch (e) {
                    global.logger.error({
                        message: 'Could not parse SIWE JSON string',
                        error: JSON.stringify(e),
                    });
                    return res
                        .status(400)
                        .send({ error: 'Could not parse SIWE JSON string' });
                }

                const siwe = new SiweMessage(parsedSiwe);

                //Get the address that signed the siwe message
                const address = siwe.address;

                // Check if the signature fits to the siwe message
                const verification = await siwe.verify({ signature: siweSig });

                if (!verification.success) {
                    global.logger.error({
                        message: `Invalid siwe sig`,
                        error: verification.error,
                    });
                    return res
                        .status(400)
                        .send({ error: `SIWE verification failed` });
                } else {
                    global.logger.debug({
                        message: `Valid siwe`,
                        data: verification.data,
                    });
                }

                const isSchemaValid = validateSchema(
                    schema.SignedUserProfile,
                    signedUserProfile,
                );

                //Check if schema is valid
                if (!isSchemaValid) {
                    global.logger.warn('invalid schema');
                    return res.status(400).send({ error: 'invalid schema' });
                }

                //Check if the profile was signed by hot wallet address
                const profileIsValid = checkUserProfileWithAddress(
                    signedUserProfile,
                    hotAddr,
                );

                //Check if profile sig is correcet
                if (!profileIsValid) {
                    global.logger.warn('invalid profile');
                    return res.status(400).send({ error: 'invalid profile' });
                }

                //One spam protection
                if (req.app.locals.config.spamProtection) {
                    global.logger.warn('Quota reached');

                    return res.status(400).send({
                        error: 'address has already claimed a subdomain',
                    });
                }

                await req.app.locals.db.setUserProfile(
                    `${address}.user.ethprague.dm3.eth`,
                    signedUserProfile,
                    hotAddr,
                );

                return res.sendStatus(200);
            } catch (e) {
                next(e);
            }
        },
    );
    router.post(
        '/name',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const { signature, name, alias } = req.body;
                logInfo({ text: `POST name`, alias });

                const profileContainer =
                    await req.app.locals.db.getProfileContainer(name);

                // check if there is a profile
                if (!profileContainer) {
                    global.logger.warn('Could not find profile');
                    return res
                        .status(400)
                        .send({ error: 'Could not find profile' });
                }

                //Check if the request comes from the owner of the name
                const sigCheck = await checkSignature(
                    profileContainer.profile.profile.publicSigningKey,
                    'alias: ' + alias,
                    signature,
                );

                if (!sigCheck) {
                    global.logger.warn('signature invalid');

                    return res.status(400).send({
                        error: 'signature invalid',
                    });
                }

                //TODO: One address can only claim one subdomain

                //To avoid spam the user is required to have at least a non-zero balance
                const sendersBalance = await web3Provider.getBalance(
                    profileContainer.address,
                );

                if (
                    req.app.locals.config.spamProtection &&
                    sendersBalance.isZero()
                ) {
                    global.logger.warn('Insuficient ETH balance');
                    return res
                        .status(400)
                        .send({ error: 'Insuficient ETH balance' });
                }

                if (!(await req.app.locals.db.setAlias(name, alias))) {
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
    router.post(
        '/deleteName',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const { signature, name } = req.body;
                logInfo({ text: `POST deleteName`, name });

                const profileContainer =
                    await req.app.locals.db.getProfileContainerForAlias(name);

                // Check if name has a connected address
                if (!profileContainer || !profileContainer.address) {
                    global.logger.warn(`Couldn't get address`);
                    return res
                        .status(400)
                        .send({ error: `Couldn't get address` });
                }

                //Check if the request comes from the owner of the name
                const sigCheck = await checkSignature(
                    profileContainer.profile.profile.publicSigningKey,
                    'remove: ' + name,
                    signature,
                );
                if (!sigCheck) {
                    global.logger.warn('signature invalid');

                    return res.status(400).send({
                        error: 'signature invalid',
                    });
                }

                (await req.app.locals.db.removeUserProfile(name))
                    ? res.sendStatus(200)
                    : res.status(500).send({
                          error: `Couldn't remove profile`,
                      });
            } catch (e) {
                next(e);
            }
        },
    );

    router.post(
        '/address',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const { signedUserProfile, address } = req.body;

                const isSchemaValid = validateSchema(
                    schema.SignedUserProfile,
                    signedUserProfile,
                );

                //Check if schema is valid
                if (!isSchemaValid) {
                    return res.status(400).send({ error: 'invalid schema' });
                }

                const profileIsValid = checkUserProfileWithAddress(
                    signedUserProfile,
                    address,
                );

                //Check if profile sig is correcet
                if (!profileIsValid) {
                    return res.status(400).send({ error: 'invalid profile' });
                }

                const hasAddressProfile =
                    !!(await req.app.locals.db.getProfileContainer(address));

                //One address can only claim one subdomain
                if (hasAddressProfile) {
                    return res.status(400).send({
                        error: 'address has already claimed a subdomain',
                    });
                }

                const name = `${address}${globalConfig.ADDR_ENS_SUBDOMAIN()}`;

                const profileExists =
                    !!(await req.app.locals.db.getProfileContainer(name));

                if (profileExists) {
                    return res
                        .status(400)
                        .send({ error: 'subdomain already claimed' });
                }

                await req.app.locals.db.setUserProfile(
                    name,
                    signedUserProfile,
                    address,
                );
                global.logger.info(`Registered ${name}`);

                return res.sendStatus(200);
            } catch (e) {
                next(e);
            }
        },
    );

    router.get(
        '/:address',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            const { address } = req.params;
            global.logger.info(`POST addr ${address} `);
            if (!ethers.utils.isAddress(address)) {
                return res.status(400).send();
            }

            const hasAddressProfile =
                !!(await req.app.locals.db.getProfileContainerByAddress(
                    address,
                ));

            if (!hasAddressProfile) {
                return res.send(404);
            }
            const profileContainer =
                await req.app.locals.db.getProfileContainerByAddress(address);
            if (!profileContainer) {
                return res.send(404);
            }

            return res.status(200).send(profileContainer.profile);
        },
    );

    router.get(
        '/name/:address',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res) => {
            const { address } = req.params;
            global.logger.info(`GET name for ${address} `);
            if (!ethers.utils.isAddress(address)) {
                return res.status(400).send();
            }

            const alias = await req.app.locals.db.getProfileAliasByAddress(
                address,
            );

            return alias
                ? res.status(200).send({ name: alias })
                : res.status(404).send();
        },
    );
    return router;
}
