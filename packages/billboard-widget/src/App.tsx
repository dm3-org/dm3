import ListMessages from './components/MessagesList';
import AutoScrollContainer, {
    ContainerProps,
} from './components/AutoScrollContainer';
import CreateMessage from './components/CreateMessage';
import Branding from './components/Branding';
import EmptyView from './components/EmptyView';
import ViewersCount from './components/ViewersCount';
import ConnectWithMetaMask from './components/ConnectWithMetaMask';
import dm3Logo from './assets/dm3-logo.png';
import useBillboard, { ClientProps } from './hooks/useBillboard';
import OptionsContext from './hooks/optionsContext';

import './styles/app.pcss';

export interface BillboardWidgetProps {
    options?: {
        className?: string;
        withToBottomButton?: boolean;
        avatarSrc?: string | ((hash?: string) => string);
    };
    clientOptions?: ClientProps;
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
    websocketUrl: 'http://localhost:3000',
};

const defaultOptions: BillboardWidgetProps['options'] = {
    avatarSrc: (hash) => {
        return `https://robohash.org/${hash}?size=38x38`;
    },
};

function App(props: BillboardWidgetProps) {
    const {
        options = defaultOptions,
        branding,
        scrollOptions,
        clientOptions = defaultClientProps,
    } = props;

    const { loading, messages, viewersCount, addRandomMessage, online } =
        useBillboard(clientOptions);

    return (
        <OptionsContext.Provider value={options}>
            <div className={`widget common-styles ${options?.className}`}>
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

            <div style={{ color: online ? 'green' : 'red' }}>
                {online ? 'online' : 'offline'}
            </div>
            <button onClick={addRandomMessage}>Send</button>

            <ConnectWithMetaMask />
        </OptionsContext.Provider>
    );
}

export default App;
