import './App.css';

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

export interface BillboardWidgetProps {
    websocketUrl: string;
    web3Provider: ethers.providers.StaticJsonRpcProvider;
    options?: {
        className?: string;
        withToBottomButton?: boolean;
    };
    clientOptions: ClientProps;
    scrollOptions?: ContainerProps;
    branding?: {
        imageSrc?: string;
        slogan?: string;
        emptyViewText?: string;
    };
}

const defaultClientProps: ClientProps = {
    mockedApi: true,
    billboardId: 'billboard.eth',
    fetchSince: undefined,
    idMessageCursor: undefined,
    baseUrl: 'localhost:8080',
    deliveryServiceUrl: 'beta-ds.dm3.eth',
    offchainResolverUrl: 'https://dm3-beta2-resolver.herokuapp.com',
    siweAddress: ethers.constants.AddressZero,
    siweSig: ethers.constants.HashZero,
};

function App(props: BillboardWidgetProps) {
    const {
        web3Provider,
        options,
        branding,
        scrollOptions,
        clientOptions = defaultClientProps,
    } = props;

    const { loading, messages, viewersCount, addRandomMessage } =
        useBillboard(clientOptions);

    return (
        <>
            <AuthContextProvider
                web3Provider={web3Provider}
                clientProps={clientOptions}
            >
                <div className={`widget ${options?.className}`}>
                    {messages?.length ? (
                        <div>
                            <div className="header">
                                <Branding
                                    imgSrc={branding?.imageSrc || dm3Logo}
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
                        />
                    )}
                </div>
                <button onClick={addRandomMessage}>Send</button>

                <ConnectWithMetaMask />
            </AuthContextProvider>
        </>
    );
}

export default App;
