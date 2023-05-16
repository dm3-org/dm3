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
    web3Provider: ethers.providers.StaticJsonRpcProvider;
    options?: {
        className?: string;
        withToBottomButton?: boolean;
        avatarSrc?: string | ((hash?: string) => string);
    };
    clientOptions?: ClientProps;
    authOptions?: AuthProps;
    scrollOptions?: ContainerProps;
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
