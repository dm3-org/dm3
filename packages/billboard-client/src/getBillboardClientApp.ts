import bodyParser from 'body-parser';
import { ethers } from 'ethers';
import express from 'express';
import http from 'http';
import { IDatabase } from './persitance/getDatabase';
import {
    Billboard,
    dsConnector,
} from './service/DsConnectorService/DsConnector';
import { ViewerService } from './service/viewerService/ViewerService';
import { getExternaApi as getExternalApi } from './api/external/getExternalApi';
import { DsConnectorService } from './service/DsConnectorService/DsConnectorService';

/**
 * An express app that sets up a basic webserver
 *
 */
export const getBillboardClientApp = async (
    provider: ethers.providers.JsonRpcProvider,
    db: IDatabase,
) => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(bodyParser.json());

    //create http server
    const httpServer = http.createServer(app);

    //Todo read billboards from config
    const billboards: Billboard[] = [];

    //Register services
    const dsConnectorService = await DsConnectorService(
        db,
        provider,
        billboards,
    );
    const viewerService = await ViewerService(httpServer);

    //Establish connection to all delivery services

    //Connect RPC handler with httpServer

    getExternalApi(viewerService);

    return app;
};
