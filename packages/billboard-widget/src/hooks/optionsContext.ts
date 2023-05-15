import { createContext } from 'react';
import { BillboardWidgetProps } from '../App';

export default createContext<BillboardWidgetProps['options']>({
    avatarSrc: (hash) => {
        return `https://robohash.org/${hash}?size=38x38`;
    },
});
