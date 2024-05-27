import axios, {
    AxiosResponse,
    AxiosError,
    AxiosRequestConfig,
    Axios,
} from 'axios';

import socketIOClient, { Socket } from 'socket.io-client';

//Make request to Server
//If 401 then re-authenticate
//and try again
export abstract class JwtInterceptor {
    private readonly baseURL: string;

    private axios: Axios;
    private socket: Socket;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
        this.initializeAxios();
    }

    //TBD child can use this method to call a method from the DS
    public getAuthenticatedAxiosClient() {
        return this.axios;
    }
    public getAuthenticatedWebSocketClient() {
        return this.socket;
    }

    protected setAuthToken(token: string) {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        this.initializeSocketIO(token);
    }

    protected async onSucces(res: AxiosResponse) {
        return res;
    }
    protected async onError(err: AxiosError) {
        if (err.response?.status === 401) {
            // re-authenticate
            const newToken = await this.onReAuth();
            const prevReq: AxiosRequestConfig = err.config;
            const newReq = {
                ...prevReq,
                headers: {
                    ...prevReq.headers,
                    Authorization: `Bearer ${newToken}`,
                },
            };
            this.setAuthToken(newToken);
            return await this.axios.request(newReq);
            //retry the request
        }
        //If the error is not 401, throw the error
        throw err;
    }

    protected abstract onReAuth(): Promise<string>;

    protected initializeAxios() {
        const onError = this.onError.bind(this);
        const _axios = axios.create({ baseURL: this.baseURL });
        _axios.interceptors.response.use(this.onSucces, onError);
        this.axios = _axios;
    }
    protected initializeSocketIO(token: string) {
        const socket = socketIOClient(this.baseURL.replace('/api', ''), {
            autoConnect: false,
            transports: ['websocket'],
        });

        socket.auth = {
            //I dont think acccount is needed any longer
            //account
            token,
        };
        socket.connect();
        this.socket = socket;
    }
}
