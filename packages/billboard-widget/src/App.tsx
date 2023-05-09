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
import { getRandomMessage } from './utils/mockMessage';

const client = getBillboardApiClient({
    mock: import.meta.env.VITE_MOCK_BILLBOARD_API === 'true',
});

const BILLBOARD_ID = import.meta.env.VITE_BILLBOARD_ID || '';

function App() {
    const [loading, setLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[] | null>([]);
    const [viewersCount, setViewersCount] = useState<number | null>(0);
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const messages = await client.getMessages(
                BILLBOARD_ID,
                Date.now(),
                '',
            );
            setMessages(messages);
            const viewers = await client.getActiveViewers(BILLBOARD_ID);
            setViewersCount(viewers);
            setLoading(false);
        };
        load();
    }, []);

    const simulateNewMessage = () => {
        if (!messages || messages.length === 0) {
            setMessages([getRandomMessage()]);
            return;
        }
        setMessages([...messages, getRandomMessage()]);
    };

    return (
        <>
            <div className="widget">
                {messages?.length ? (
                    <div>
                        <div className="header">
                            <Branding imgSrc={dm3Logo} slogan="powered by" />
                            <ViewersCount viewers={viewersCount} />
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
