import { ReactNode } from 'react';
import eyeIcon from '../assets/eye-icon.svg';
import { useViewersCount } from '../hooks/useViewersCount';

interface Props {
    icon?: ReactNode;
}

function ViewersCount(props: Props) {
    const { icon } = props;
    const viewersCount = useViewersCount();
    return (
        <div className="viewers-count">
            {icon ? icon : <img src={eyeIcon} alt="Eye Icon" />}
            <div className="text-xs">{viewersCount} viewers</div>
        </div>
    );
}

export default ViewersCount;
