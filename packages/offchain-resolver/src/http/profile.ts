import { globalConfig, logInfo, validateSchema } from 'dm3-lib-shared';
import { schema, checkUserProfileWithAddress } from 'dm3-lib-profile';
import { ethers } from 'ethers';
import express from 'express';
import { WithLocals } from './types';
import { SiweMessage } from 'siwe';

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
                    req.app.locals.logger.error({
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
                    req.app.locals.logger.error({
                        message: `Invalid siwe sig`,
                        error: verification.error,
                    });
                    return res
                        .status(400)
                        .send({ error: `SIWE verification failed` });
                } else {
                    req.app.locals.logger.debug({
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
                    req.app.locals.logger.warn('invalid schema');
                    return res.status(400).send({ error: 'invalid schema' });
                }

                //Check if the profile was signed by hot wallet address
                const profileIsValid = checkUserProfileWithAddress(
                    signedUserProfile,
                    hotAddr,
                );

                //Check if profile sig is correcet
                if (!profileIsValid) {
                    req.app.locals.logger.warn('invalid profile');
                    return res.status(400).send({ error: 'invalid profile' });
                }

                //One spam protection
                if (req.app.locals.config.spamProtection) {
                    req.app.locals.logger.warn('Quota reached');

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
                const { signedUserProfile, name, ensName } = req.body;
                logInfo({ text: `POST name`, name });

                const isSchemaValid = validateSchema(
                    schema.SignedUserProfile,
                    signedUserProfile,
                );

                const address = await web3Provider.resolveName(ensName);

                if (!address) {
                    req.app.locals.logger.warn(`Couldn't get address`);
                    return res
                        .status(400)
                        .send({ error: `Couldn't get address` });
                }

                //Check if schema is valid
                if (!isSchemaValid) {
                    req.app.locals.logger.warn('invalid schema');
                    return res.status(400).send({ error: 'invalid schema' });
                }

                const profileIsValid = checkUserProfileWithAddress(
                    signedUserProfile,
                    address,
                );

                //Check if profile sig is correcet
                if (!profileIsValid) {
                    req.app.locals.logger.warn('invalid profile');
                    return res.status(400).send({ error: 'invalid profile' });
                }

                const hasAddressProfile =
                    await req.app.locals.db.hasAddressProfile(address);

                //One address can only claim one subdomain

                if (req.app.locals.config.spamProtection && hasAddressProfile) {
                    req.app.locals.logger.warn('Quota reached');

                    return res.status(400).send({
                        error: 'address has already claimed a subdomain',
                    });
                }

                //The /address endpoint has to be used to create an subdomain based on a address
                const nameIsAddress = ethers.utils.isAddress(
                    name.split('.')[0],
                );

                if (nameIsAddress) {
                    return res.status(400).send({
                        error: 'Invalid ENS name',
                    });
                }

                const sendersBalance = await web3Provider.getBalance(address);

                //To avoid spam the user is required to have at least a non-zero balance
                if (
                    req.app.locals.config.spamProtection &&
                    sendersBalance.isZero()
                ) {
                    req.app.locals.logger.warn('Insuficient ETH balance');
                    return res
                        .status(400)
                        .send({ error: 'Insuficient ETH balance' });
                }

                const profileExists = await req.app.locals.db.getUserProfile(
                    name,
                );

                if (profileExists) {
                    req.app.locals.logger.warn('subdomain already claimed');
                    return res
                        .status(400)
                        .send({ error: 'subdomain already claimed' });
                }
                await req.app.locals.db.setUserProfile(
                    name,
                    signedUserProfile,
                    address,
                );

                return res.sendStatus(200);
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
                    await req.app.locals.db.hasAddressProfile(address);

                //One address can only claim one subdomain
                if (hasAddressProfile) {
                    return res.status(400).send({
                        error: 'address has already claimed a subdomain',
                    });
                }

                const name = `${address}${globalConfig.ADDR_ENS_SUBDOMAIN()}`;

                const profileExists = await req.app.locals.db.getUserProfile(
                    name,
                );

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
                req.app.locals.logger.info(`Registered ${name}`);

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
            req.app.locals.logger.info(`POST addr ${address} `);
            if (!ethers.utils.isAddress(address)) {
                return res.status(400).send();
            }

            const hasAddressProfile = await req.app.locals.db.hasAddressProfile(
                address,
            );

            if (!hasAddressProfile) {
                return res.send(404);
            }
            const userProfile = await req.app.locals.db.getUserProfileByAddress(
                address,
            );
            if (!userProfile) {
                return res.send(404);
            }

            return res.status(200).send(userProfile);
        },
    );

    router.get(
        '/name/:address',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res) => {
            const { address } = req.params;
            req.app.locals.logger.info(`GET name for ${address} `);
            if (!ethers.utils.isAddress(address)) {
                return res.status(400).send();
            }

            const name = await req.app.locals.db.getNameByAddress(address);

            return name
                ? res.status(200).send({ name })
                : res.status(404).send();
        },
    );
    return router;
}
