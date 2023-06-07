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
        /** A custom user name resolver function that takes the users
         * identifier and returns a new string. `(identifier: string) => MayBePromise<username>`
         **/
        userNameResolver?:
            | string
            | ((hash?: string) => string | Promise<string>);
        /** Formatting string for the date of each message, using date-fns formatter function:
         * see: https://date-fns.org/v2.30.0/docs/format
         * Default: `P`
         */
        dateFormat?: string;
        /** Display a relative date, for recent dates. Default is `true`.  */
        relativeDate?: boolean;
        /**The timeout after a new message can be sent in ms  */
        timeout?: number;
    };
    /** Config for the billboard message fetching part.
     *  - mockedApi: boolean; if you don't have a client yet you can use a mocked version.
     *  - billboardId: string; the ENS of the billboard you wan't to display.
     *  - billboardClientUrl: string; the url of the billboard client.
     *  - deliveryServiceEnsName: string; the ENS of the delivery service you want to use.
     *  - offchainResolverUrl: string; the url of the offchain resolver.
     *  - siweAddress: string; the address the siwe messages was signed from.
     *  - siweSig: string; the signature of the siwe message.
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
export type ClientProps = {
    mockedApi: boolean;
    billboardId: string;
    billboardClientUrl: string;
    deliveryServiceEnsName: string;
    offchainResolverUrl: string;
    siweAddress?: string;
    siweSig?: string;
    siweMessage?: string;
};
