import { useContext } from 'react';
interface Props {
    identifier: string;
}

import optionsContext from '../hooks/optionsContext';
function Avatar(props: Props) {
    const { avatarSrc } = useContext(optionsContext) || {};
    const { identifier } = props;

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
