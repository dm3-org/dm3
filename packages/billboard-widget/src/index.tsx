import App from './App';
import { BillboardWidgetProps, ClientProps } from './types';
import 'normalize.css';
import './styles/app.pcss';

export function Dm3Widget(props: BillboardWidgetProps) {
    return (
        <>
            <App {...props} />
        </>
    );
}
export type { ClientProps, BillboardWidgetProps };
