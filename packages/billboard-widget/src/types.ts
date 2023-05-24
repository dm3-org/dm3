import { ethers } from 'ethers';
import { ContainerProps } from './components/AutoScrollContainer';

export interface BillboardWidgetProps {
    /** A StaticJsonRpcProvider */
    web3Provider: ethers.providers.StaticJsonRpcProvider;
    /** Custom class name added to the main component div */
    options?: {
        /** Custom class name added to the main component div */
        className?: string;
        /** A custom url for all user avatars or a function that takes the users
         * identifier and returns the url. `(identifier: string) => url`
         **/
        avatarSrc?: string | ((hash?: string) => string);
    };
    /** Config for the billboard message fetching part.
     *  - mockedApi: boolean; if you don't have a client yet you can use a mocked version.
     *  - billboardId: string;
     *  - fetchSince: Date;
     *  - limit: number;
 
     **/
    clientProps: ClientProps;
    /** Fine tune your auto scrolling
     * - withToBottomButton?: boolean; Whether to display a Scroll-to-Bottom
     * - behavior?: 'smooth' | 'auto';
     * - containerClassName?: string;
     */
    scrollOptions?: ContainerProps;
    /**
     * Branding options to customize the default DM3 branding logos etc.
     * - logoImageSrc?: string; small logo displayed always on top.
     * - emptyMessagesImageSrc?: string; displayed when no messages received.
     * - slogan?: string; displayed next to small logo on top.
     * - emptyViewText?: string; A small text display when no messages received.
     */
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
          deliveryServiceUrl: string;
          offchainResolverUrl: string;
          siweAddress: string;
          siweSig: string;
          siweMessage: string;
      }
    | {
          mockedApi: false;
          billboardId: string;
          baseUrl: string;
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
    baseUrl: 'localhost:8080', //TBD add  billboard url
    deliveryServiceUrl: 'ethprague-ds.dm3.eth',
    offchainResolverUrl: 'https://billboard-ethprague.herokuapp.com',

    siweAddress: dummySiweOwner.address,
    siweSig:
        // eslint-disable-next-line max-len
        '0xb320a80194f35d2a7ab44eaaeffe77eb1d361334162417c546d42e8eb7e718a724b0436f08f971b96245401c9e80689892c8ad04ab352a99c4f6bd10c8aaad091c',
    siweMessage: dummySiweOwner.address,
};

export const defaultOptions: BillboardWidgetProps['options'] = {
    avatarSrc: (hash) => {
        return `https://robohash.org/${hash}?size=38x38`;
    },
};
