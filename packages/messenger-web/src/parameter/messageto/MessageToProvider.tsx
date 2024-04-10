import React, { ReactNode } from 'react';
import { MessageToContext } from './MessageToContext'; // Import the context object

// Custom hook to manage message destination
import { useMessageTo } from './useMessageTo';

// Props type definition for the provider, specifying that it accepts ReactNode children.
interface MessageToProviderProps {
    children: ReactNode;
}

const MessageToProvider = ({ children }: MessageToProviderProps) => {
    const [messageTo, isMessageToSet] = useMessageTo();

    // The value provided by the provider must match the 'MessageToContextType'.
    // This ensures that the consumers of this context receive the correct data types.
    return (
        <MessageToContext.Provider value={{ messageTo, isMessageToSet }}>
            {children}
        </MessageToContext.Provider>
    );
};

export default MessageToProvider;
