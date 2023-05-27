import App from './App';
import { BillboardWidgetProps } from './types';

export function Dm3Widget(props: BillboardWidgetProps) {
    return (
        <>
            <App {...props} />
        </>
    );
}
