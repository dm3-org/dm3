import { ethers } from 'ethers';
import { ContainerProps } from './components/AutoScrollContainer';

export interface BillboardWidgetProps {
    websocketUrl: string;
    web3Provider: ethers.providers.StaticJsonRpcProvider;
    options?: {
        className?: string;
        withToBottomButton?: boolean;
    };
    clientProps: ClientProps;
    scrollOptions?: ContainerProps;
    branding?: {
        imageSrc?: string;
        slogan?: string;
        emptyViewText?: string;
    };
}
export type ClientProps =
    | {
          mockedApi: true;
          billboardId: string;
          baseUrl: string;
          fetchSince?: Date;
          idMessageCursor?: string;
          deliveryServiceUrl: string;
          offchainResolverUrl: string;
          siweAddress: string;
          siweSig: string;
          siweMessage: string;
      }
    | {
          mockedApi?: false;
          billboardId: string;
          baseUrl: string;
          fetchSince?: Date;
          idMessageCursor?: string;
          deliveryServiceUrl: string;
          offchainResolverUrl: string;
          siweAddress: string;
          siweSig: string;
          siweMessage: string;
      };
const dummySiweOwner = new ethers.Wallet(
    '0xa3366f151f21907c765632ae41498c3863ef15a1e7350f95b453c32743b6fa3d',
);
export const defaultClientProps: ClientProps = {
    mockedApi: true,
    billboardId: 'billboard1.billboard.ethprague.dm3.eth',
    fetchSince: undefined,
    idMessageCursor: undefined,
    baseUrl: 'localhost:8080',//TBD add  billboard url
    deliveryServiceUrl: 'beta-ds.dm3.eth',
    offchainResolverUrl: 'https://billboard-ethprague.herokuapp.com',

    siweAddress: dummySiweOwner.address,
    siweSig:
        // eslint-disable-next-line max-len
        '0xb320a80194f35d2a7ab44eaaeffe77eb1d361334162417c546d42e8eb7e718a724b0436f08f971b96245401c9e80689892c8ad04ab352a99c4f6bd10c8aaad091c',
    siweMessage: dummySiweOwner.address,
};
