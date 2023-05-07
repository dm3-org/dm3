import { useEffect, useState } from 'react';
import './App.css';

import { getBillboardApiClient } from 'dm3-lib-billboard-api';
import { Message } from 'dm3-lib-messaging';
import ListMessages from './components/MessagesList';
import AutoScrollContainer from './components/AutoScrollContainer';
import CreateMessage from './components/CreateMessage';
import Branding from './components/Branding';
import EmptyView from './components/EmptyView';
import ViewersCount from './components/ViewersCount';
import dm3Logo from './assets/dm3-logo.png';

const client = getBillboardApiClient({ mock: true });

function App() {
    const [loading, setLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[] | null>([]);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const result = await client.getMessages('', 12323, '');
            setMessages(result);
            setLoading(false);
        };
        load();
    }, []);

    const simulateNewMessage = () => {
        if (!messages || messages.length === 0) {
            return;
        }
        setMessages([...messages, messages[0]]);
    };

    return (
        <>
            <div className="widget">
                {messages?.length ? (
                    <div>
                        <div className="header">
                            <Branding imgSrc={dm3Logo} slogan="powered by" />
                            <ViewersCount viewers={123} />
                        </div>

                        <AutoScrollContainer containerClassName="widget-container styled-scrollbars">
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
                    <EmptyView info="This is the DM3 Billboard Widget" />
                )}
            </div>
            <button onClick={simulateNewMessage}>Send</button>
        </>
    );
}

export default App;
