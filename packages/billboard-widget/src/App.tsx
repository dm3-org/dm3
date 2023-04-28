import { useEffect, useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

import { getBillboardApiClient } from 'dm3-lib-billboard-api';
import { Message } from 'dm3-lib-messaging';
import ListMessages from './components/ListMessages';

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
        if (!messages) {
            return;
        }
        setMessages([...messages, messages[0]]);
    };

    return (
        <>
            <div className="widget">
                <div className="gradient-shadow"></div>
                {loading ? <div>loading ...</div> : null}
                {messages && messages.length > 0 ? (
                    <div>
                        <ListMessages messages={messages} />
                    </div>
                ) : null}
            </div>
            <button onClick={simulateNewMessage}>Send</button>
        </>
    );
}

export default App;
