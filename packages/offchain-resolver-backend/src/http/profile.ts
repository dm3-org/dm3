import { globalConfig, log, validateSchema } from 'dm3-lib-shared/dist.backend';
import {
    schema,
    checkUserProfileWithAddress,
} from 'dm3-lib-profile/dist.backend';
import { ethers } from 'ethers';
import express from 'express';
import { WithLocals } from './types';

//The test msg should just be the sg of an ethereum address
const MSG_START = 0;
const MSG_END = 42;

export function profile(web3Provider: ethers.providers.BaseProvider) {
    const router = express.Router();

    //Special route for eth prague
    router.post(
        '/nameP',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const {
                    signedUserProfile,
                    name,

                    siweMessage,
                    siweSig,
                } = req.body;

                const address = ethers.utils.recoverAddress(
                    ethers.utils.hashMessage(siweMessage),
                    siweSig,
                );
                const isAddressVailid =
                    ethers.utils.getAddress(
                        siweMessage.substring(MSG_START, MSG_END),
                    ) === address;

                if (!isAddressVailid) {
                    req.app.locals.logger.warn(`Invalid siwe sig`);
                    return res.status(400).send({ error: `Invaid siwe sig` });
                }

                const isSchemaValid = validateSchema(
                    schema.SignedUserProfile,
                    signedUserProfile,
                );

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

                //One address can only claim one subdomain

                if (req.app.locals.config.spamProtection) {
                    req.app.locals.logger.warn('Quota reached');

                    return res.status(400).send({
                        error: 'address has already claimed a subdomain',
                    });
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
        '/name',
        //@ts-ignore
        async (req: express.Request & { app: WithLocals }, res, next) => {
            try {
                const { signedUserProfile, name, ensName } = req.body;
                log(`POST name ${name} `);

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
