import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
interface Props {
    identifier: string;
}

function Avatar(props: Props) {
    const { options } = useContext(GlobalContext) || {};
    const { identifier } = props;
    const avatarSrc = options?.avatarSrc;
    return (
        <div className="avatar">
            {avatarSrc ? (
                <img
                    loading="lazy"
                    width="38px"
                    height="38px"
                    src={
                        typeof avatarSrc === 'string'
                            ? avatarSrc
                            : avatarSrc(identifier)
                    }
                    alt={`cute robot avatar of dm3 user: ${identifier}`}
                />
            ) : null}
        </div>
    );
}

export default Avatar;
