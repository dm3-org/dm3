import './App.css';

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

export interface BillboardWidgetProps {
    websocketUrl: string;
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
};

function App(props: BillboardWidgetProps) {
    const {
        options,
        branding,
        scrollOptions,
        clientOptions = defaultClientProps,
    } = props;

    const { loading, messages, viewersCount, addRandomMessage } =
        useBillboard(clientOptions);

    return (
        <>
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
        </>
    );
}

export default App;
