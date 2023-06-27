import * as dotenv from 'dotenv';
import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import cors from 'cors';
import winston from 'winston';
import { getDatabase } from './persistance/getDatabase';
import { resolverEndpoint } from './http/resolverEndpoint';
import { getWeb3Provider } from './utils/getWeb3Provider';
import { getSigner } from './utils/getSigner';
import { readKeyFromEnv } from './utils/readKeyEnv';
import { profile } from './http/profile';

dotenv.config();

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

    app.locals.db = await getDatabase(app.locals.logger);
    app.locals.config = {
        spamProtection: process.env.SPAM_PROTECTION === 'true',
    };

    app.use('/', resolverEndpoint());
    app.use('/profile', profile(getWeb3Provider()));
})();
const port = process.env.PORT || '8081';
server.listen(port, () => {
    app.locals.logger.info(
        '[Server] listening at port ' + port + ' and dir ' + __dirname,
    );
});
