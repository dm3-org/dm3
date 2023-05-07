import { ReactNode } from 'react';
import eyeIcon from '../assets/eye-icon.svg';

interface Props {
    viewers: number;
    icon?: ReactNode;
}

function ViewersCount(props: Props) {
    const { icon, viewers = 0 } = props;

    return (
        <div className="viewers-count">
            {icon ? icon : <img src={eyeIcon} alt="Eye Icon" />}
            <div className="text-xs">{viewers} viewers</div>
        </div>
    );
}

export default ViewersCount;
