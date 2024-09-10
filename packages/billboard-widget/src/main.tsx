import 'normalize.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/app.pcss';
import './styles/classic.pcss';
import { BillboardWidgetProps } from './types.ts';
import { WidgetDemo } from './views/WidgetDemo.tsx';
import { WagmiWrapper } from './views/WagmiWrapper.tsx';

export const defaultOptions: BillboardWidgetProps['options'] = {
    avatarSrc: (hash) => {
        return `https://robohash.org/${hash}?size=38x38`;
    },
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <WagmiWrapper>
            <WidgetDemo />
        </WagmiWrapper>
    </React.StrictMode>,
);
