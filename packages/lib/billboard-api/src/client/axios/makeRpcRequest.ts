import { Axios } from 'axios';
import { log } from 'dm3-lib-shared';

interface RpcRequest {
    axios: Axios;
    method: string;
    params: string[];
}

interface RpcResponse<T> {
    jsonrpc: string;
    id: string;
    result: T;
    error?: { code: number; message: string; data?: any };
}

export async function makeRpcRequest<T>({
    axios,
    method,
    params,
}: RpcRequest): Promise<T | null> {
    const url = `/rpc`;

    const body = {
        jsonrpc: '2.0',
        method,
        params,
    };

    const { data } = await axios.post<RpcResponse<T>>(url, { data: body });

    const { error, result } = data;

    if (error) {
        log(error.message);
        return null;
    }
    return result;
}
