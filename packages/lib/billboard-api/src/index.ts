import { IBillboardApiClient } from './client/IBillboardApiClient';
import { getAxiosClient } from './client/axios/getAxiosClient';
import { getMockClient } from './client/axios/getMockClient';

export function getBillboardApiClient({
    mock,
}: {
    mock: boolean;
}): IBillboardApiClient {
    if (mock) {
        return getMockClient();
    }
    return getAxiosClient();
}
