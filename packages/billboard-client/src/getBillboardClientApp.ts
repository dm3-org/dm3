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
import { ConfigService } from './service/ConfigService/ConfigService';

/**
 * An express app that sets up a basic webserver
 *
 */
export const getBillboardClientApp = async (
    provider: ethers.providers.JsonRpcProvider,
    db: IDatabase,
    port: number,
) => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(bodyParser.json());

    //create http server
    const httpServer = http.createServer(app);

    //Readng the ENV config file
    const config = ConfigService().readConfigFromEnv();

    //Each Ens name provided in the config file is an billboard instance
    //Right now we're using one profile and hence one private key for all billboards
    //This might change later though
    const billboards: Billboard[] = config.ensNames.map((ensName) => ({
        ensName,
        privateKey: config.privateKey,
    }));

    //Register services
    const viewerService = await ViewerService(httpServer);
    const dsConnectorService = await DsConnectorService(
        db,
        provider,
        billboards,
        viewerService.broadcastMessage,
    );

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
