import App from './App';
import { BillboardWidgetProps, ClientProps } from './types';
import 'normalize.css';
// import './styles/app.pcss';
import './styles/classic.pcss';

export function Dm3Widget(props: BillboardWidgetProps) {
    return (
        <>
            <App {...props} />
        </>
    );
}
export type { ClientProps, BillboardWidgetProps };
