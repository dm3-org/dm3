import { useContext, useEffect, useMemo, useState } from 'react';
import { format, formatRelative } from 'date-fns';
import { GlobalContext } from '../context/GlobalContext';

interface Props {
    timestamp: number;
    from: string;
}

function MessageFooter(props: Props) {
    const { timestamp, from } = props;

    const [userName, setUserName] = useState('');

    const { options } = useContext(GlobalContext) || {};

    const formattedDate = useMemo(() => {
        return options?.relativeDate
            ? formatRelative(timestamp, new Date())
            : format(timestamp, options?.dateFormat || 'P');
    }, [options?.relativeDate, timestamp, options?.dateFormat]);

    useEffect(() => {
        const resolveUserName = async () => {
            if (typeof options?.userNameResolver === 'function') {
                const resolvedUserName = await options.userNameResolver(from);
                setUserName(resolvedUserName);
            } else {
                setUserName(from);
            }
        };

        resolveUserName();
    }, [from, options]);

    return (
        <div className="meta">
            <div className="sender text-xxs">"{userName}"</div>
            <div className="time text-xxs">{formattedDate}</div>
        </div>
    );
}

export default MessageFooter;
