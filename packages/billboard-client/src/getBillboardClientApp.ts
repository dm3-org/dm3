import bodyParser from 'body-parser';
import { UserProfile } from 'dm3-lib-profile';
import express from 'express';
import { IDatabase, getDatabase } from './persitance/getDatabase';
import winston from 'winston';

/**
 * An express app that sets up a basic webserver
 *
 */
export const getBillboardClientApp = async (
    //web3Provider: ethers.providers.BaseProvider,
    db: IDatabase,
    profile: UserProfile,
) => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(bodyParser.json());

    //Start web server

    return app;
};
