import { useContext } from 'react';
import AutoScrollContainer from '../components/AutoScrollContainer';
import Branding from '../components/Branding';
import CreateMessage from '../components/CreateMessage';
import EmptyView from '../components/EmptyView';
import MessagesList from '../components/MessagesList';
import ViewersCount from '../components/ViewersCount';
import { GlobalContext } from '../context/GlobalContext';
import useBillboard from '../hooks/useBillboard';
import dm3Logo from './../assets/dm3-logo.png';
export const MessengerView = () => {
    const { loading, messages, viewersCount, sendDm3Message } = useBillboard();
    const { options, branding, scrollOptions } = useContext(GlobalContext);
    return (
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
                                <MessagesList messages={messages} />
                            </div>
                        ) : null}
                    </AutoScrollContainer>
                    <CreateMessage onCreateMsg={sendDm3Message} />
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
    );
    ƒ;
};
