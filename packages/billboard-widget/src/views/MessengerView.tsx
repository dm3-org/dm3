import { useContext } from 'react';
import AutoScrollContainer from '../components/AutoScrollContainer';
import Branding from '../components/Branding';
import CreateMessage from '../components/CreateMessage';
import EmptyView from '../components/EmptyView';
import MessagesList from '../components/MessagesList';
import ViewersCount from '../components/ViewersCount';
import { GlobalContext } from '../context/GlobalContext';
import useBillboard from '../hooks/useBillboard';
import dm3Logo from './../assets/dm3_dark.png';
import { AuthContext } from '../context/AuthContext';
export const MessengerView = () => {
    const { loading, messages, sendDm3Message } = useBillboard();
    const { options, branding, scrollOptions } = useContext(GlobalContext);
    const { initialized } = useContext(AuthContext);
    return (
        <div className={`widget common-styles ${options?.className}`}>
            <div>
                <div className="header">
                    <Branding
                        imgSrc={branding?.imageSrc || dm3Logo}
                        slogan={branding?.slogan || 'powered by'}
                    />
                    <ViewersCount />
                </div>
                {messages.length ? (
                    <AutoScrollContainer
                        containerClassName="widget-container styled-scrollbars"
                        {...scrollOptions}
                    >
                        <div className="gradient-shadow"></div>
                        {loading ? <div>loading ...</div> : null}
                        {messages && messages.length > 0 ? (
                            <div>
                                <MessagesList messages={messages} />
                            </div>
                        ) : null}
                    </AutoScrollContainer>
                ) : (
                    <EmptyView
                        info={
                            branding?.emptyViewText ||
                            'This is the DM3 Billboard Widget'
                        }
                    />
                )}
                {initialized ? (
                    <CreateMessage onCreateMsg={sendDm3Message} />
                ) : (
                    <p style={{ textAlign: 'center' }}>
                        Please Sign in with Ethereum to send a message with DM3
                    </p>
                )}
            </div>
        </div>
    );
};
