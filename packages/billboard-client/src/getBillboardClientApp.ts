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
import { log } from 'dm3-lib-shared';

/**
 * An express app that sets up a basic webserver
 *
 */
export const getBillboardClientApp = async (
    provider: ethers.providers.JsonRpcProvider,
    db: IDatabase,
    port: number,
    pkBillboard1: string,
) => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(bodyParser.json());

    //create http server
    const httpServer = http.createServer(app);

    //Todo read billboards from config
    const billboards: Billboard[] = [
        {
            ensName: 'billboard1.eth',
            privateKey: pkBillboard1,
        },
    ];

    //Register services
    const dsConnectorService = await DsConnectorService(
        db,
        provider,
        billboards,
    );

    const viewerService = await ViewerService(httpServer);

    //Establish connection to all delivery services

    //Connect RPC handler with httpServer
    app.use(getExternalApi(db, viewerService));

    httpServer.listen(port, () => {
        log('billboard client listening at port ' + port);
    });

    //In oder to finish the test everything has to be cleaned up
    //Hence we're closing the httpServer and all connected socket
    const disconnect = () => {
        httpServer.close();
        dsConnectorService.disconnect();
    };

    //Return both app and httpServer because its handy to be able to access the httpServer in tests
    return { app, disconnect };
};
