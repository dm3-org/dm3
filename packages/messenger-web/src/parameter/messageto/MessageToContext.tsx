import { createContext, useContext } from 'react';
import { useMessageTo } from './useMessageTo'; // Import the custom hook to manage the message destination

// Define a type for the context value
interface MessageToContextType {
    messageTo: string | null;
    isMessageToSet: () => boolean;
}

// Create the context with an initial undefined value. The actual value is provided by the provider.
// TypeScript requires us to provide an initial value or explicitly allow 'undefined'.
const MessageToContext = createContext<MessageToContextType | undefined>(undefined);

// Custom hook for accessing our context. This ensures type safety and throws an error
// if the context is used outside of a provider, preventing runtime errors.
function useMessageToContext() {
    const context = useContext(MessageToContext);
    if (context === undefined) {
        throw new Error('useMessageToContext must be used within a MessageToProvider');
    }
    return context;
}

export { MessageToContext, useMessageToContext };
