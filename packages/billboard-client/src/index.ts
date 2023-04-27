import bodyParser from 'body-parser';
import { log } from 'dm3-lib-shared';
import ethers from 'ethers';
import express from 'express';
import { getDeliveryServiceWSClient as DeliveryServiceWSClient } from './api/internal/ws/getDeliveryServiceWSClient';
import { getOwnDm3Profile } from './billboard/dm3/getOwnDm3Profile';
import { getDatabase } from './persitance/getDatabase';

/**
 * An express app that sets up a basic webserver
 *
 */
const main = async () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(bodyParser.json());

    const rpcUrl = process.env['RPC'];
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const db = await getDatabase(app.locals.logger);

    const { profile } = await getOwnDm3Profile(provider);

    DeliveryServiceWSClient(profile.deliveryServices).onMessage(
        db.createMessage,
    );

    //Start web server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        log(`Listening on port ${port}`);
    });
    return app;
};

main();
