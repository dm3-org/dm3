import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import AvatarPlaceholder from '../assets/avatar-placeholder.svg';
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
                    alt={`avatar of  ${identifier}`}
                />
            ) : (
                <img
                    width="38px"
                    height="38px"
                    src={AvatarPlaceholder}
                    alt="Avatar image"
                />
            )}
        </div>
    );
}

export default Avatar;
