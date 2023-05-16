import { ethers } from 'ethers';
import dm3Logo from './assets/dm3-logo.png';
import AutoScrollContainer, {
    ContainerProps,
} from './components/AutoScrollContainer';
import Branding from './components/Branding';
import ConnectWithMetaMask from './components/ConnectWithMetaMask';
import CreateMessage from './components/CreateMessage';
import EmptyView from './components/EmptyView';
import ListMessages from './components/MessagesList';
import ViewersCount from './components/ViewersCount';
import { AuthContextProvider } from './context/AuthContext';
import useBillboard, { ClientProps } from './hooks/useBillboard';
import OptionsContext from './hooks/optionsContext';

import './styles/app.pcss';
import { AuthProps } from './hooks/useAuth';

export interface BillboardWidgetProps {
    /** A StaticJsonRpcProvider */
    web3Provider: ethers.providers.StaticJsonRpcProvider;
    /** common billboard widget options */
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
     *  - websocketUrl: string;
     **/
    clientOptions?: ClientProps;
    /**
     * Auth options are required to submit a new message using your dm3 profile.
     * - deliveryServiceUrl: string;
     * - offchainResolverUrl: string;
     * - siweAddress: string;
     * - siweSig: string;
     */
    authOptions?: AuthProps;
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
        logoImageSrc?: string;
        emptyMessagesImageSrc?: string;
        slogan?: string;
        emptyViewText?: string;
    };
}

const defaultClientProps: ClientProps = {
    mockedApi: true,
    billboardId: 'billboard.eth',
    fetchSince: undefined,
    limit: undefined,
    websocketUrl: 'http://localhost:3000',
};

const defaultAuthOptions = {
    deliveryServiceUrl: 'beta-ds.dm3.eth',
    offchainResolverUrl: 'https://dm3-beta2-resolver.herokuapp.com',
    siweAddress: ethers.constants.AddressZero,
    siweSig: ethers.constants.HashZero,
};

const defaultOptions: BillboardWidgetProps['options'] = {
    avatarSrc: (hash) => {
        return `https://robohash.org/${hash}?size=38x38`;
    },
};

function App(props: BillboardWidgetProps) {
    const {
        authOptions = defaultAuthOptions,
        branding,
        clientOptions = defaultClientProps,
        options = defaultOptions,
        scrollOptions,
        web3Provider,
    } = props;

    const { loading, messages, viewersCount, addRandomMessage, online } =
        useBillboard(clientOptions);

    return (
        <OptionsContext.Provider value={options}>
            <AuthContextProvider
                web3Provider={web3Provider}
                clientProps={authOptions}
            >
                <div className={`widget common-styles ${options?.className}`}>
                    {messages?.length ? (
                        <div>
                            <div className="header">
                                <Branding
                                    imgSrc={branding?.logoImageSrc || dm3Logo}
                                    slogan={branding?.slogan || 'powered by'}
                                />
                                <ViewersCount viewers={viewersCount} />
                            </div>

                            <AutoScrollContainer
                                containerClassName="widget-container styled-scrollbars"
                                {...scrollOptions}
                            >
                                <div className="gradient-shadow"></div>
                                {loading ? <div>loading ...</div> : null}
                                {messages && messages.length > 0 ? (
                                    <div>
                                        <ListMessages messages={messages} />
                                    </div>
                                ) : null}
                            </AutoScrollContainer>
                            <CreateMessage />
                        </div>
                    ) : (
                        <EmptyView
                            info={
                                branding?.emptyViewText ||
                                'This is the DM3 Billboard Widget'
                            }
                            imgSrc={branding?.emptyMessagesImageSrc}
                        />
                    )}
                </div>

                <div style={{ color: online ? 'green' : 'red' }}>
                    {online ? 'online' : 'offline'}
                </div>
                <button onClick={addRandomMessage}>Send</button>

                <ConnectWithMetaMask />
                <ConnectWithMetaMask />
            </AuthContextProvider>
        </OptionsContext.Provider>
    );
}

export default App;
