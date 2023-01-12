import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import cors from 'cors';
import winston from 'winston';
import { getDatabase } from './persistance/getDatabase';
import { ccipGateway } from './http/ccipGateway';
import { getWeb3Provider } from './utils/getWeb3Provider';
import { getSigner } from './utils/getSigner';
import { readKeyFromEnv } from './utils/readKeyEnv';

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());

(async () => {
    app.locals.logger = winston.createLogger({
        transports: [new winston.transports.Console()],
    });

    app.locals.db = await getDatabase();
    app.locals.web3Provider = getWeb3Provider();

    const signer = getSigner();
    const resolverAddress = readKeyFromEnv('RESOLVER_ADDR');

    app.use(ccipGateway(signer, resolverAddress));
})();
