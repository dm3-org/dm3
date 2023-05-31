import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import { getBillboardApiClient } from 'dm3-lib-billboard-client-api';

export const useViewersCount = () => {
    const {
        clientProps: { mockedApi, billboardId, billboardClientUrl },
    } = useContext(GlobalContext);
    const [viewersCount, setViewersCount] = useState<number>(0);

    const client = getBillboardApiClient({
        mock: !!mockedApi,
        baseURL: billboardClientUrl,
    });

    useEffect(() => {
        const fetchViewersCounts = async () => {
            const viewers = await client.getActiveViewers(billboardId || '');
            setViewersCount(viewers || 0);
        };
        fetchViewersCounts();
        const interval = setInterval(fetchViewersCounts, 5000);

        return () => clearInterval(interval);
    }, [client, billboardId]);

    return viewersCount;
};
