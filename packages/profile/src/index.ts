import bodyParser from 'body-parser';
import express from 'express';
import http from 'http';
import cors from 'cors';
import winston from 'winston';
import { getDatabase } from './persistance/getDatabase';
import { addProfileResource } from './http/addProfileResource';

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

    app.use(addProfileResource());
})();
