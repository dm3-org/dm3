import { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import AvatarPlaceholder from '../assets/avatar-placeholder.svg';
interface Props {
    identifier: string;
}

function Avatar(props: Props) {
    const { options } = useContext(GlobalContext) || {};
    const { identifier } = props;
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const resolveUserName = async () => {
            if (typeof options?.avatarSrc === 'function') {
                const avatarUrl = await options?.avatarSrc(identifier);
                setAvatarUrl(avatarUrl);
            }
            if (typeof options?.avatarSrc === 'string') {
                setAvatarUrl(options?.avatarSrc);
            }
        };

        resolveUserName();
    }, [identifier, options, options?.avatarSrc]);
    return (
        <div className="avatar">
            {avatarUrl ? (
                <img
                    loading="lazy"
                    width="38px"
                    height="38px"
                    src={avatarUrl}
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
