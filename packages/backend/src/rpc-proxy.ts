import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        console.log('rpc ' + process.env.RPC);
        const data = (await axios.post(process.env.RPC as string, req.body))
            .data;
        console.log('data ' + data);
        res.json(data);
    } catch (e) {
        next(e);
    }
});

export default router;
