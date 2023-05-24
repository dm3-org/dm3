import bodyParser from 'body-parser';
import { log } from 'dm3-lib-shared';
import { ethers } from 'ethers';
import express from 'express';
import http from 'http';
import { getExternalApi as getExternalApi } from './api/external/getExternalApi';
import { IDatabase } from './persitance/getDatabase';
import { ConfigService } from './service/ConfigService/ConfigService';
import { Billboard } from './service/dsManager/DsManagerImpl';
import { DsManagerService } from './service/dsManager/DsManagerService';
import { ViewerService } from './service/viewerService/viewerService';

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
    log('[getBillboardClientApp] config ' + JSON.stringify(config), 'debug');

    //Each Ens name provided in the config file is an billboard instance
    //Right now we're using one profile and hence one private key for all billboards
    //This might change later though
    const billboards: Billboard[] = config.ensNames.map((ensName) => ({
        ensName,
        privateKey: config.privateKey,
    }));
    log(
        '[getBillboardClientApp] billboards ' + JSON.stringify(billboards),
        'debug',
    );

    //Register services
    const viewerService = await ViewerService(httpServer);
    const dsConnectorService = await DsManagerService(
        db,
        provider,
        billboards,
        viewerService.broadcastMessage,
    );

    //Establish connection to all delivery services

    //Connect RPC handler with httpServer
    app.use(getExternalApi(db, viewerService));

    httpServer.listen(port, () => {
        log('billboard client listening at port ' + port, 'info');
    });

    //In oder to finish the test everything has to be cleaned up
    //Hence we're closing the httpServer and all connected socket
    const disconnect = async () => {
        httpServer.close();
        setImmediate(function () {
            httpServer.emit('close');
        });

        dsConnectorService.disconnect();
    };

    //Return both app and httpServer because its handy to be able to access the httpServer in tests
    return { app, disconnect };
};
