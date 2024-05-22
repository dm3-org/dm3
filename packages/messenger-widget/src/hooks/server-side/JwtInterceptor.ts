import axios, {
    AxiosResponse,
    AxiosError,
    AxiosRequestConfig,
    Axios,
} from 'axios';

//Make request to Server
//If 401 then re-authenticate
//and try again
export abstract class JwtInterceptor {
    private axios: Axios;

    constructor(baseURL: string) {
        this.initializeAxios(baseURL);
    }

    //TBD child can use this method to call a method from the DS
    public getAuthenticatedAxiosClient() {
        return this.axios;
    }
    protected setAuthToken(token: string) {
        this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

    protected initializeAxios(baseURL: string) {
        const onError = this.onError.bind(this);
        const _axios = axios.create({ baseURL });
        _axios.interceptors.response.use(this.onSucces, onError);
        this.axios = _axios;
    }
}
