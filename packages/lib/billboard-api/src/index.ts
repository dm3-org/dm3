import { IBillboardApiClient } from './client/IBillboardApiClient';
import { getAxiosClient } from './client/axios/getAxiosClient';
import { getMockClient } from './client/axios/getMockClient';

export function getBillboardApiClient({
    mock,
    baseURL,
}: {
    mock: boolean;
    baseURL: string;
}): IBillboardApiClient {
    if (mock) {
        return getMockClient();
    }
    return getAxiosClient(baseURL);
}
