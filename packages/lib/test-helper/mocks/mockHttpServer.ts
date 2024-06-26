import { createServer, Server as HttpServerType } from 'http';
export async function mockHttpServer(port: number): Promise<HttpServerType> {
    const httpServer = createServer();

    await new Promise<boolean>((res, rej) => {
        httpServer.listen(port, () => {
            res(true);
        });
    });

    return httpServer;
}
