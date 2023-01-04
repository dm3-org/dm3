import express from 'express';

export function getProfileResource() {
    const app = express();

    app.get('/', (req, res) => {
        return res.send(200);
    });

    return app;
}
