import { useContext, useEffect } from 'react';
import { StorageContext } from '../../context/StorageContext';

export const useHaltDelivery = () => {
    const { getHaltedMessages, initialized: storageInitialized } =
        useContext(StorageContext);
    useEffect(() => {
        // Fetch all messages the user has halted. Then check if they can be delivered now.
        const handleHaltedMessages = async () => {
            const haltedMessages = await getHaltedMessages();
            console.log('haltedMessages', haltedMessages);
        };
        handleHaltedMessages();
    }, [storageInitialized]);

    return {};
};
