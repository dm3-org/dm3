import axios, {
    Axios,
    AxiosError,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';
import { Console } from 'console';
import { GetResource, UserProfile } from '../account/Account';
import { IpfsResolver } from '../account/profileResolver/IpfsResolver';
import { DeliveryServiceResolver } from '../account/profileResolver/json/DeliveryServiceResolver';
import { LinkResolver } from '../account/profileResolver/LinkResolver';
import { ProfileResolver } from '../account/profileResolver/ProfileResolver';
import { Connection } from '../web3-provider/Web3Provider';

export interface DeliveryServiceProfile {
    publicSigningKey: string;
    publicEncryptionKey: string;
    url: string;
}

export interface DeliveryServiceProperties {
    messageTTL: number;
    //Number of bytes an envelop object should not exceed
    sizeLimit: number;
}

export async function getDeliveryServiceProfile(
    deliveryServiceEnsName: string,
    { provider }: Connection,
    getRessource: GetResource<DeliveryServiceProfile>,
): Promise<DeliveryServiceProfile | undefined> {
    const DELIVERY_SERVICE_PROFILE_KEY = 'eth.dm3.deliveryService';
    const ensResolver = await provider?.getResolver(deliveryServiceEnsName);

    if (!ensResolver) {
        throw 'Unknown ENS name';
    }

    const textRecord = await ensResolver?.getText(DELIVERY_SERVICE_PROFILE_KEY);

    const resolver: ProfileResolver<DeliveryServiceProfile>[] = [
        LinkResolver(getRessource),
        IpfsResolver(getRessource),
        DeliveryServiceResolver(),
    ];

    const profile = await resolver
        .find((r) => r.isProfile(textRecord))
        ?.resolveProfile(textRecord);

    return profile;
}

export function getDeliveryServiceClient(
    profile: UserProfile,
    connection: Connection,
    getRessource: GetResource<DeliveryServiceProfile>,
): Axios {
    const getDeliveryServiceUrl = async (index: number) => {
        const deliveryServiceProfile = await getDeliveryServiceProfile(
            profile.deliveryServices[index],
            connection,
            getRessource,
        );

        return deliveryServiceProfile?.url;
    };

    // eslint-disable-next-line max-len
    //The DeliveryServiceLookupInterceptor checks if a request made to the deliveryService was successful. If so everything is fine and the response will be returned. If not the interceptor fetched the profile of the next deliveryService and retries the request.
    const DeliveryServiceLookupInterceptor = (
        currentDeliveryServiceProfile: number,
    ) => {
        //The Lookup always starts at 0
        const onSucces = (res: AxiosResponse) => res;

        //The request has failed. We are trying to send the same request to the next delivery service.
        const onError = async (err: AxiosError) => {
            currentDeliveryServiceProfile++;
            //If there is no delivery service left,the request finally results in an error
            if (
                profile.deliveryServices[currentDeliveryServiceProfile] ===
                undefined
            ) {
                return err;
            }

            const nextBaseUrl = await getDeliveryServiceUrl(
                currentDeliveryServiceProfile,
            );

            const instance = axios.create();

            const { onSucces, onError } = DeliveryServiceLookupInterceptor(
                currentDeliveryServiceProfile,
            );

            instance.interceptors.response.use(onSucces, onError);

            const req: AxiosRequestConfig = {
                ...err.config,
                baseURL: nextBaseUrl,
            };

            return await instance.request(req);
        };

        return { onSucces, onError };
    };
    const instance = axios.create();

    const INITIAL_DELIVERY_SERVICE = 0;
    //The url of the first deliverServiy is going to be used as the BaseUrl of the returned instance
    const { onSucces, onError } = DeliveryServiceLookupInterceptor(
        INITIAL_DELIVERY_SERVICE,
    );
    instance.interceptors.response.use(onSucces, onError);
    instance.interceptors.request.use(async (config: AxiosRequestConfig) => {
        const initialBaseUrl = await getDeliveryServiceUrl(
            INITIAL_DELIVERY_SERVICE,
        );

        return { ...config, baseURL: initialBaseUrl };
    });

    return instance;
}
