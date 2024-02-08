// Importing the necessary modules and functions
import cors from 'cors';
import { normalizeEnsName } from '@dm3-org/dm3-lib-profile';
import express from 'express';
import { auth } from './utils';
import {
    validateNewNotificationChannelData,
    validateNotificationChannelType,
} from './validation/notification/notificationChannelValidation';
import {
    ChannelNotSupportedError,
    addNewNotificationChannel,
    resendOtp,
} from '@dm3-org/dm3-lib-delivery';
import { getDeliveryServiceProperties } from './config/getDeliveryServiceProperties';
import { IDatabase } from './persistance/getDatabase';

// Exporting a function that returns an Express router
export default () => {
    const router = express.Router();

    // Applying CORS middleware to allow cross-origin requests
    router.use(cors());

    // Adding a route parameter middleware named 'ensName'
    router.param('ensName', auth);

    // Defining a route to enable/disable global notifications
    router.post('/global/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);

            // Extracting isEnabled from the request body
            const { isEnabled } = req.body;

            // return if value is not a boolean
            if (typeof isEnabled !== 'boolean') {
                return res.sendStatus(400).json({
                    error: 'Invalid value',
                });
            }

            // set global notification to the database
            await req.app.locals.db.setGlobalNotification(account, {
                isEnabled,
            });

            // Sending a success response
            res.sendStatus(200);
        } catch (e) {
            // Passing the error to the next middleware
            next(e);
        }
    });

    // Defining a route to handle GET requests for fetching global notification
    router.get('/global/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);

            // fetching global notification setting for a user from the database
            const globalNotification =
                await req.app.locals.db.getGlobalNotification(account);

            // Sending the fetched global notification setting as a JSON response
            res.json(globalNotification);
        } catch (e) {
            // Passing the error to the next middleware
            next(e);
        }
    });

    // Defining a route to handle POST requests for resending OTP
    router.post('/otp/:ensName', async (req, res, next) => {
        // Extracting notificationChannelType from the request body
        const { notificationChannelType } = req.body;

        try {
            const account = normalizeEnsName(req.params.ensName);

            // Validate notificationChannelType data
            const { isValid, errorMessage } = validateNotificationChannelType(
                notificationChannelType,
            );

            // Return if invalid data found
            if (!isValid) {
                res.sendStatus(400).json({
                    error: errorMessage,
                });
            }

            // Fetch global notification data of user from database
            const globalNotification =
                await req.app.locals.db.getGlobalNotification(account);

            // if global notification is turned off
            if (!globalNotification.isEnabled) {
                res.sendStatus(400).json({
                    error: 'Global notifications is off',
                });
            } else {
                await resendOtp(
                    account,
                    notificationChannelType,
                    getDeliveryServiceProperties().notificationChannel,
                    req.app.locals.db as IDatabase,
                );
                // Sending a success response
                res.sendStatus(200);
            }
        } catch (e: any) {
            if (
                e instanceof ChannelNotSupportedError ||
                e.message === 'Invalid config.yml'
            ) {
                // return the error for not supported channels
                res.sendStatus(400).json({
                    error: `Notification channel ${notificationChannelType} is currently not supported yet by the DS`,
                });
            } else {
                // Passing the error to the next middleware
                next(e);
            }
        }
    });

    // Defining a route to handle POST requests for adding an notification channel
    router.post('/:ensName', async (req, res, next) => {
        // Extracting recipientValue & notificationChannelType from the request body
        const { recipientValue, notificationChannelType } = req.body;

        try {
            const account = normalizeEnsName(req.params.ensName);

            // Validate req.body data
            const { isValid, errorMessage } =
                validateNewNotificationChannelData(
                    notificationChannelType,
                    recipientValue,
                );

            // Return if invalid data found
            if (!isValid) {
                res.sendStatus(400).json({
                    error: errorMessage,
                });
            }

            // Fetch global notification data of user from database
            const globalNotification =
                await req.app.locals.db.getGlobalNotification(account);

            // Throw error if global notification is turned off
            if (!globalNotification.isEnabled) {
                res.sendStatus(400).json({
                    error: 'Global notifications is off',
                });
            } else {
                // add new notification channel & send OTP for verification
                await addNewNotificationChannel(
                    notificationChannelType,
                    recipientValue,
                    account,
                    getDeliveryServiceProperties().notificationChannel,
                    req.app.locals.db as IDatabase,
                );

                // Sending a success response
                res.sendStatus(200);
            }
        } catch (e: any) {
            if (
                e instanceof ChannelNotSupportedError ||
                e.message === 'Invalid config.yml'
            ) {
                // return the error for not supported channels
                res.sendStatus(400).json({
                    error: `Notification channel ${notificationChannelType} is currently not supported yet by the DS`,
                });
            } else {
                // Passing the error to the next middleware
                next(e);
            }
        }
    });

    // Defining a route to handle GET requests for fetching notification channels
    router.get('/:ensName', async (req, res, next) => {
        try {
            const account = normalizeEnsName(req.params.ensName);

            // Fetch global notification data of user from database
            const globalNotification =
                await req.app.locals.db.getGlobalNotification(account);

            // if global notification is turned off
            if (!globalNotification.isEnabled) {
                res.status(200).json({ notificationChannels: [] });
            } else {
                // Getting notification channels for a user from the database
                const notificationChannels =
                    await req.app.locals.db.getUsersNotificationChannels(
                        account,
                    );

                // Sending the fetched notification channels as a JSON response
                res.status(200).json({ notificationChannels });
            }
        } catch (e) {
            // Passing the error to the next middleware
            next(e);
        }
    });

    // Returning the configured router
    return router;
};
